type ChartCardProps = {
  title: string;
  children: React.ReactNode;
};

export default function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="rounded-card clay-gradient p-6 shadow-card-md transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-[2px] hover:shadow-card-md-hover">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
