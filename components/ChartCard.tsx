type ChartCardProps = {
  title: string;
  children: React.ReactNode;
};

export default function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="rounded-card bg-surface p-6 shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:shadow-lg hover:-translate-y-[2px]">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
