type ChartCardProps = {
  title: string;
  children: React.ReactNode;
  /**
   * Stretch the card to fill its grid cell and let the chart expand to
   * match the tallest sibling (e.g. a donut with a legend next to a
   * shorter chart). Fixes the "empty space at the bottom of the card"
   * look when grid rows are stretched.
   */
  fill?: boolean;
};

export default function ChartCard({ title, children, fill }: ChartCardProps) {
  return (
    <div
      className={`rounded-card bg-surface p-6 shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:shadow-lg hover:-translate-y-[2px] ${
        fill ? "flex h-full flex-col" : ""
      }`}
    >
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <div className={`mt-4 ${fill ? "flex min-h-0 flex-1 flex-col" : ""}`}>
        {children}
      </div>
    </div>
  );
}
