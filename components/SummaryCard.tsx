type SummaryCardProps = {
  title: string;
  value: string;
  subtitle?: string;
};

export default function SummaryCard({ title, value, subtitle }: SummaryCardProps) {
  return (
    <div className="rounded-card bg-clay-surface p-6 clay-shadow transition-shadow hover:clay-shadow-hover">
      <p className="text-sm text-text-muted">{title}</p>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums">
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
      )}
    </div>
  );
}
