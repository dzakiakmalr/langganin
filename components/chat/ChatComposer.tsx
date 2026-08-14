"use client";

import {
  useEffect,
  useRef,
  type KeyboardEvent,
} from "react";
import { Send, Square } from "lucide-react";

// ---------------------------------------------------------------------------
// ChatComposer — textarea + send/stop button.
//
// Mobile-friendly: min-h-[44px] tap target, no `position: fixed` so the
// mobile keyboard pushes it up via dynamic viewport height (the parent
// flex container shrinks when the keyboard appears).
// ---------------------------------------------------------------------------

type ChatComposerProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder: string;
  sendLabel: string;
  stopLabel: string;
};

export default function ChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  onKeyDown,
  isStreaming,
  disabled,
  placeholder,
  sendLabel,
  stopLabel,
}: ChatComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize up to ~5 rows.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  return (
    <div className="flex items-end gap-2 border-t border-white/40 bg-clay-100/60 p-3">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        disabled={disabled}
        rows={1}
        className="min-h-[44px] max-h-[160px] flex-1 resize-none rounded-2xl border border-white/60 bg-surface px-3.5 py-2.5 text-base leading-relaxed text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60 sm:text-sm"
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          aria-label={stopLabel}
          title={stopLabel}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warning text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-warning/40"
        >
          <Square size={14} fill="currentColor" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={value.trim().length === 0}
          aria-label={sendLabel}
          title={sendLabel}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
        >
          <Send size={16} />
        </button>
      )}
    </div>
  );
}
