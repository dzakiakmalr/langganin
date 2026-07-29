export default function LoadingSkeleton() {
  return (
    <div aria-busy="true" className="space-y-6">
      {/* Hero line */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-64 rounded-card bg-clay-surface animate-shimmer" />
        <div className="h-6 w-32 rounded-pill bg-clay-surface animate-shimmer" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-card clay-gradient p-6 shadow-card-sm">
            <div className="h-4 w-28 rounded bg-clay-surface animate-shimmer" />
            <div className="mt-3 h-8 w-40 rounded bg-clay-surface animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Content row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-card clay-gradient p-6 shadow-card-md">
          <div className="h-6 w-48 rounded bg-clay-surface animate-shimmer" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-[16px] bg-white/20 px-4 py-3"
              >
                <div className="h-4 w-32 rounded bg-clay-surface animate-shimmer" />
                <div className="h-4 w-24 rounded bg-clay-surface animate-shimmer" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-card clay-gradient p-6 shadow-card-md">
          <div className="h-6 w-40 rounded bg-clay-surface animate-shimmer" />
          <div className="mt-4 flex items-center justify-center">
            <div className="h-[220px] w-[220px] rounded-full bg-clay-surface animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
