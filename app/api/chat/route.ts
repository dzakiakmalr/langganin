import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  chatModel,
  generationConfig,
  type ChatContext,
  type ChatLocale,
} from "@/lib/ai/config";

// Force Node.js runtime — the AI SDK's OpenRouter provider uses Node-only
// APIs (env access, fetch body streaming). Edge would silently fall back
// to a different runtime and break streaming.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// MaxDuration is read by Next.js for route-level timeouts. 30s is plenty
// for chat; can be raised if we add agentic tool loops (FE-07).
export const maxDuration = 30;

// ---------------------------------------------------------------------------
// /api/chat — streaming chat using Vercel AI SDK + OpenRouter.
//
// Body shape (matches useChat's `DefaultChatTransport({ body })` payload):
//   { messages: UIMessage[], locale: 'id'|'en', context: { subscriptions, categories } }
//
// The user's subscription snapshot is shipped with every request so the
// model can answer "my data" questions without any DB access. When the
// real backend lands, swap `context` for a server-side query by user_id.
// ---------------------------------------------------------------------------

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(z.unknown()),
  // Anything else from the AI SDK UIMessage is tolerated as unknown; we
  // only need the role + parts for `convertToModelMessages`.
});

const contextSchema = z.object({
  subscriptions: z.array(z.unknown()).max(500),
  categories: z.array(z.unknown()).max(50),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(60),
  locale: z.enum(["id", "en"]),
  context: contextSchema,
});

const MAX_CONTEXT_BYTES = 32 * 1024; // 32 KB hard cap on the prompt data

function errorResponse(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return NextResponse.json(
    { error: { code, message } },
    { status },
  );
}

export async function POST(request: Request): Promise<Response> {
  // 1. API key check — never expose to client, only ever read here.
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your-openrouter-api-key") {
    return errorResponse(
      503,
      "NO_API_KEY",
      "OPENROUTER_API_KEY is not configured on the server.",
    );
  }

  // 2. Body parsing + zod validation.
  let bodyJson: unknown;
  try {
    bodyJson = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body is not valid JSON.");
  }

  const parsed = requestSchema.safeParse(bodyJson);
  if (!parsed.success) {
    return errorResponse(
      400,
      "VALIDATION_ERROR",
      parsed.error.issues.map((i) => i.message).join("; "),
    );
  }

  const { messages, locale, context } = parsed.data;

  // 3. Cheap size guard so a malicious client can't blow up the prompt.
  const approxBytes =
    JSON.stringify(context.subscriptions).length +
    JSON.stringify(context.categories).length;
  if (approxBytes > MAX_CONTEXT_BYTES) {
    return errorResponse(
      413,
      "CONTEXT_TOO_LARGE",
      "Subscription context exceeds the server size cap.",
    );
  }

  // 4. Build the system prompt inline so the route stays small and the
  //    prompt logic stays testable in lib/ai/config.ts.
  const { buildSystemPrompt } = await import("@/lib/ai/config");
  const systemPrompt = buildSystemPrompt(
    context as ChatContext,
    locale as ChatLocale,
  );

  console.log(
    `[chat] request — messages=${messages.length} locale=${locale} context=${approxBytes}B keyPrefix=${apiKey.slice(0, 4)}`,
  );

  // 5. Stream the response.
  try {
    const modelMessages = await convertToModelMessages(messages as UIMessage[]);
    const result = streamText({
      model: chatModel,
      system: systemPrompt,
      messages: modelMessages,
      temperature: generationConfig.temperature,
      maxOutputTokens: generationConfig.maxOutputTokens,
      topP: generationConfig.topP,
      // Log the upstream error server-side so we can diagnose 4xx/5xx
      // from OpenRouter (auth, rate limit, model unavailable, etc.) without
      // leaking internal details to the client. The AI SDK emits a generic
      // error message to the stream regardless, and the route's catch
      // block handles hard failures before the stream starts.
      onError: ({ error }) => {
        console.error("[chat] streamText error:", error);
      },
    });

    return createUIMessageStreamResponse({
      stream: result.toUIMessageStream(),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to reach OpenRouter";
    console.error("[chat] upstream error:", err);
    return errorResponse(502, "UPSTREAM_UNREACHABLE", message);
  }
}
