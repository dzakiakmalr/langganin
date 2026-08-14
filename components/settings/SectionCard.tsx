import type { ReactNode } from "react";

export default function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card bg-surface p-5 shadow-md sm:p-6">
      <div className="mb-5">
        <h2 className="font-display text-lg font-bold text-text">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
