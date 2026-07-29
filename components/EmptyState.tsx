type EmptyStateProps = {
  message: string;
  actionLabel: string;
};

export default function EmptyState({ message, actionLabel }: EmptyStateProps) {
  return (
    <section className="rounded-card clay-gradient p-12 text-center shadow-card-md">
      <p className="text-5xl">📭</p>
      <p className="mx-auto mt-4 max-w-sm text-text-muted">{message}</p>
      <button
        type="button"
        disabled
        className="mt-6 cursor-not-allowed rounded-pill bg-clay-surface px-6 py-2.5 text-sm font-semibold text-text-muted opacity-60 shadow-none"
      >
        {actionLabel}
      </button>
    </section>
  );
}
