"use client";

import { Sparkles } from "lucide-react";

import ChatMarkdown from "@/components/ChatMarkdown";

// ---------------------------------------------------------------------------
// ChatMessage — single bubble in the AI chat panel.
//
// Pure presentation: knows nothing about useChat. Pass the role, the raw
// text content (joined from message parts in the parent), and the thinking
// state. The component decides which variant to render:
//   - user  → plain text bubble, brand-500 fill
//   - assistant + thinking → dots indicator
//   - assistant + text    → markdown-rendered bubble
// ---------------------------------------------------------------------------

type ChatMessageProps = {
  role: "user" | "assistant" | "system";
  /** Plain text content. For assistant messages this should be the
   *  concatenated `parts` text — markdown is rendered inline. */
  content: string;
  /** True when this is the in-flight assistant message with no text yet. */
  showThinking: boolean;
  thinkingLabel: string;
};

export default function ChatMessage({
  role,
  content,
  showThinking,
  thinkingLabel,
}: ChatMessageProps) {
  const isUser = role === "user";
  return (
    <li
      className={`flex items-end gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white shadow-clay"
        >
          <Sparkles size={14} />
        </span>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[78%] ${
          isUser
            ? "rounded-br-md bg-brand-500 text-white"
            : "rounded-bl-md border border-brand-100/60 bg-surface text-text"
        }`}
      >
        {showThinking ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="text-xs font-medium italic text-text-muted">
              {thinkingLabel}
            </span>
            <Dot delay={0} />
            <Dot delay={150} />
            <Dot delay={300} />
          </span>
        ) : isUser ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {content}
          </p>
        ) : (
          <ChatMarkdown content={content} />
        )}
      </div>
      {isUser && (
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clay-200 text-text-muted"
        >
          <span className="font-display text-xs font-bold">U</span>
        </span>
      )}
    </li>
  );
}

function Dot({ delay }: { delay: number }) {
  // animationDelay is the only inline style here — for staggering the
  // three dots. Same pattern as Sidebar.tsx's filter blur.
  return (
    <span
      aria-hidden
      className="inline-block h-1.5 w-1.5 rounded-full bg-text-muted animate-chat-dot"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
