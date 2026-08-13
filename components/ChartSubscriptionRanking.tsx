"use client";

import BrandLogo from "@/components/BrandLogo";
import { formatIdr } from "@/lib/utils/format-currency";
import type { SubscriptionRankingDatum } from "@/lib/utils/analytics";
import { useRouter } from "@/i18n/navigation";

type ChartSubscriptionRankingProps = {
  data: SubscriptionRankingDatum[];
  /** Localized hint shown in the card footer (e.g. "Klik bar untuk detail"). */
  hintLabel: string;
};

/**
 * Brand color → translucent rgba. Same helper as the subscriptions page
 * (SubscriptionCard / SubscriptionRow) so the tint + bar fill match that
 * screen's "subtle brand transparency" look.
 */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Custom row-based ranking — mirrors the subscriptions page's list view:
 * each row shows the brand logo tile + name + price, with a translucent
 * brand-colored bar underneath (width = share of the most expensive sub).
 *
 * Rendered as HTML instead of a Recharts SVG so the logo + hover tint look
 * exactly like the subscriptions page. Each row is clickable → detail page.
 */
export default function ChartSubscriptionRanking({
  data,
  hintLabel,
}: ChartSubscriptionRankingProps) {
  const router = useRouter();

  if (data.length === 0) return null;

  // Builder sorts descending, so the first row is the largest spend — the
  // reference for the bar widths.
  const max = data[0]?.total ?? 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {data.map((d) => {
          const pct = max > 0 ? Math.max(6, (d.total / max) * 100) : 0;
          return (
            <li
              key={d.id}
              className="flex min-h-[46px] flex-1 flex-col justify-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => router.push(`/dashboard/subscriptions/${d.id}`)}
                title={hintLabel}
                className="flex w-full items-center gap-2.5 rounded-[10px] px-1.5 py-1 text-left transition-colors hover:bg-[var(--row-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                style={
                  { "--row-hover": hexToRgba(d.color, 0.06) } as React.CSSProperties
                }
              >
                <BrandLogo
                  logoSrc={d.logoUrl}
                  color={d.color}
                  name={d.name}
                  size={26}
                  rounded="rounded-[7px]"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">
                  {d.name}
                </span>
                <span
                  className="shrink-0 text-sm font-bold tabular-nums"
                  style={{ color: d.color }}
                >
                  {formatIdr(d.total)}
                  <span className="ml-1 text-xs font-normal text-text-muted">
                    /bln
                  </span>
                </span>
              </button>
              {/* Translucent brand-colored bar — aligned under the name */}
              <div className="ml-9 h-1.5 overflow-hidden rounded-full bg-clay-100">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: hexToRgba(d.color, 0.45),
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 shrink-0 text-right text-[11px] text-text-subtle">
        {hintLabel}
      </p>
    </div>
  );
}
