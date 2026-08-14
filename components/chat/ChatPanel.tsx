"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  AlertCircle,
  ArrowDown,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import ChatComposer from "@/components/chat/ChatComposer";
import ChatMessage from "@/components/chat/ChatMessage";
import type { Category, Subscription } from "@/types/subscription";

// ---------------------------------------------------------------------------
// ChatPanel — the streaming AI assistant embedded in the Analytics page.
//
// Uses Vercel AI SDK's `useChat` hook for:
//   - SSE protocol handling (managed by `DefaultChatTransport`)
//   - automatic message history persistence across turns
//   - `stop()` that aborts the in-flight fetch WITHOUT losing the partial
//     assistant message — that's the requirement: "Generation bisa
//     dihentikan mid-stream tanpa merusak state percakapan".
//
// Layout-agnostic: fills its parent and handles its own internal scroll.
// On desktop the parent provides a sticky column; on mobile the parent
// passes `min-h-0` so this panel's inner overflow works inside the
// tab content.
// ---------------------------------------------------------------------------

type ChatPanelProps = {
  subscriptions: Subscription[];
  categories: Category[];
};

const PIN_THRESHOLD_PX = 40;

export default function ChatPanel({
  subscriptions,
  categories,
}: ChatPanelProps) {
  const t = useTranslations("Analytics");
  const locale = useLocale();

  const { messages, sendMessage, stop, status, error, regenerate } =
    useChat({
      id: "analytics-ai",
      transport: new DefaultChatTransport({
        api: "/api/chat",
        body: {
          locale,
          context: { subscriptions, categories },
        },
      }),
    });

  const [input, setInput] = useState("");
  const isStreaming = status === "submitted" || status === "streaming";

  // ── Auto-scroll with pin detection ────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinnedToBottom, setPinnedToBottom] = useState(true);

  const recomputePinned = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setPinnedToBottom(distance < PIN_THRESHOLD_PX);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", recomputePinned, { passive: true });
    return () => el.removeEventListener("scroll", recomputePinned);
  }, [recomputePinned]);

  // Auto-scroll on new content ONLY while pinned. Tested live during
  // streaming: scrolled to top → new tokens don't yank scroll position;
  // pinned at bottom → always follows the latest.
  useEffect(() => {
    if (!pinnedToBottom) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, pinnedToBottom]);

  const handleSubmit = useCallback(() => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    void sendMessage({ text });
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const jumpToLatest = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setPinnedToBottom(true);
  }, []);

  const suggestions = [
    t("suggestedPrompt1"),
    t("suggestedPrompt2"),
    t("suggestedPrompt3"),
  ];

  const hasMessages = messages.length > 0;
  const noKeyError =
    error?.message?.includes("NO_API_KEY") ||
    error?.message?.toLowerCase().includes("not configured");

  return (
    <div className="glass-panel flex h-full min-h-0 flex-col overflow-hidden rounded-card shadow-md">
      <header className="flex items-center justify-between gap-3 border-b border-white/40 px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-pill bg-brand-50 text-brand-600"
          >
            <Sparkles size={16} />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-text">
              {t("chatTitle")}
            </h2>
            <p className="text-xs text-text-muted">{t("chatDescription")}</p>
          </div>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mx-5 mt-4 flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p>{noKeyError ? t("chatErrorNoKey") : t("chatErrorGeneric")}</p>
          </div>
          {!noKeyError && (
            <button
              type="button"
              onClick={() => void regenerate()}
              className="ml-2 inline-flex items-center gap-1 rounded-pill bg-surface px-2.5 py-1 text-xs font-semibold text-danger shadow-sm hover:bg-white"
            >
              <RefreshCcw size={12} />
              {t("chatRetry")}
            </button>
          )}
        </div>
      )}

      <div className="relative flex-1 min-h-0">
        <div ref={scrollRef} className="h-full overflow-y-auto px-5 py-5">
          {!hasMessages ? (
            <EmptyState
              emptyHint={t("chatEmptyHint")}
              suggestions={suggestions}
              disabled={isStreaming}
              onSelect={(s) => void sendMessage({ text: s })}
            />
          ) : (
            <ul className="flex flex-col gap-4">
              {messages.map((m, idx) => {
                const isLastAssistant =
                  m.role === "assistant" && idx === messages.length - 1;
                const text = m.parts
                  .filter((p) => p.type === "text")
                  .map((p) => p.text)
                  .join("");
                const showThinking =
                  isLastAssistant && isStreaming && text.length === 0;
                return (
                  <ChatMessage
                    key={m.id}
                    role={m.role}
                    content={text}
                    showThinking={showThinking}
                    thinkingLabel={t("chatThinking")}
                  />
                );
              })}
            </ul>
          )}
        </div>

        {!pinnedToBottom && hasMessages && isStreaming && (
          <button
            type="button"
            onClick={jumpToLatest}
            className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-pill bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover hover:-translate-x-1/2"
          >
            <ArrowDown size={12} />
            {t("chatJumpToLatest")}
          </button>
        )}
      </div>

      {/* Composer in normal flow — mobile keyboard pushes it into view
          naturally via dynamic viewport height. */}
      <ChatComposer
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        onStop={() => stop()}
        onKeyDown={handleKeyDown}
        isStreaming={isStreaming}
        disabled={noKeyError}
        placeholder={t("chatPlaceholder")}
        sendLabel={t("chatSend")}
        stopLabel={t("chatStop")}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state — shown before the user sends the first message. Inline here
// (not its own file) because it's small and only used here.
// ---------------------------------------------------------------------------

type EmptyStateProps = {
  emptyHint: string;
  suggestions: string[];
  disabled: boolean;
  onSelect: (text: string) => void;
};

function EmptyState({
  emptyHint,
  suggestions,
  disabled,
  onSelect,
}: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-8 text-center">
      <span className="text-4xl" aria-hidden>
        ✨
      </span>
      <div className="flex w-full max-w-md flex-col items-stretch gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
          {emptyHint}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(s)}
              disabled={disabled}
              className="rounded-pill border border-white/60 bg-surface px-3 py-1.5 text-xs font-semibold text-text shadow-sm transition-colors hover:bg-clay-100 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
