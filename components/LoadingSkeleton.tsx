export default function LoadingSkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-6">
      {/* Hero line */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-64 rounded-card bg-clay-surface" />
        <div className="h-6 w-32 rounded-pill bg-clay-surface" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-card bg-clay-surface p-6">
            <div className="h-4 w-28 rounded bg-clay-surface/80" />
            <div className="mt-3 h-8 w-40 rounded bg-clay-surface/80" />
          </div>
        ))}
      </div>

      {/* Content row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Renewals skeleton */}
        <div className="rounded-card bg-clay-surface p-6">
          <div className="h-6 w-48 rounded bg-clay-surface/80" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-card bg-clay-surface/50 px-4 py-3"
              >
                <div className="h-4 w-32 rounded bg-clay-surface/80" />
                <div className="h-4 w-24 rounded bg-clay-surface/80" />
              </div>
            ))}
          </div>
        </div>
        {/* Chart skeleton */}
        <div className="rounded-card bg-clay-surface p-6">
          <div className="h-6 w-40 rounded bg-clay-surface/80" />
          <div className="mt-4 flex items-center justify-center">
            <div className="h-[220px] w-[220px] rounded-full bg-clay-surface/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
