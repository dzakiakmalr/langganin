"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMarkdownProps = {
  content: string;
};

// Custom renderers — keep them minimal so the markdown tree stays fast
// to re-render on every streaming delta. Tailwind classes only (AGENTS.md
// §2 "Never use inline styles").
const components: Components = {
  p: ({ children }) => (
    <p className="mb-2 leading-relaxed last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-text">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    // External-only by default; the chat shouldn't normally produce links,
    // but if it does, mark them safe-by-default and force new-tab.
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-600 underline decoration-brand-500/40 underline-offset-2 hover:decoration-brand-500"
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    // react-markdown emits inline `<code>` for single-backtick content and
    // a `<code>` inside `<pre>` for fenced blocks. Without a language hint
    // it's inline; otherwise it's a fenced block — we style both.
    const isInline = !className?.includes("language-");
    if (isInline) {
      return (
        <code
          className="rounded bg-clay-100 px-1 py-0.5 font-mono text-[0.85em] text-text"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="block overflow-x-auto whitespace-pre font-mono text-[0.85em] text-text"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-2xl bg-clay-100 p-3 last:mb-0">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-clay-200 pl-3 italic text-text-muted last:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-clay-100" />,
};

export default function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
