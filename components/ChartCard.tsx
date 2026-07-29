type ChartCardProps = {
  title: string;
  children: React.ReactNode;
};

export default function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="rounded-card bg-clay-surface p-6 clay-shadow transition-shadow hover:clay-shadow-hover">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
