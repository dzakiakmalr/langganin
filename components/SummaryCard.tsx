type SummaryCardProps = {
  title: string;
  value: string;
  subtitle?: string;
};

export default function SummaryCard({ title, value, subtitle }: SummaryCardProps) {
  return (
      <div className="rounded-card bg-surface p-6 shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:shadow-lg hover:-translate-y-[2px]">
      <p className="text-sm text-text-muted">{title}</p>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight tabular-nums">
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
      )}
    </div>
  );
}
