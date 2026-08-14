"use client";

import { format, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatIdr } from "@/lib/utils/format-currency";
import type { TrendDatum } from "@/lib/utils/analytics";

type ChartMonthlyTrendProps = {
  data: TrendDatum[];
};

type TooltipPayload = {
  payload?: TrendDatum;
  value?: number;
};

type TooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
};

function TrendTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0]?.payload;
  if (!datum) return null;
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.75)",
        boxShadow: "0 8px 32px rgba(15,23,42,0.10)",
        color: "#1F2024",
        fontSize: "13px",
        fontWeight: 500,
        padding: "8px 12px",
      }}
    >
      <div className="text-xs text-text-muted">
        {format(datum.monthStart, "MMMM yyyy")}
      </div>
      <div className="mt-0.5 font-display font-bold tabular-nums">
        {formatIdr(datum.total)}
      </div>
    </div>
  );
}

export default function ChartMonthlyTrend({ data }: ChartMonthlyTrendProps) {
  if (data.length === 0) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Chart grows to fill the stretched card; min-height keeps a usable
          base height when the card isn't stretched (mobile single column). */}
      <div className="min-h-0 flex-1" style={{ minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            barCategoryGap="22%"
          >
            <defs>
              <linearGradient id="trend-bar-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EE8A66" />
                <stop offset="100%" stopColor="#C95A36" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 6"
              vertical={false}
              stroke="rgba(15,23,42,0.08)"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#5C5A57", fontSize: 12 }}
              dy={6}
            />
            <YAxis
              tickFormatter={(v: number) =>
                v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
              }
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8C8884", fontSize: 11 }}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "rgba(226,107,67,0.06)" }}
              content={<TrendTooltip />}
            />
            <Bar
              dataKey="total"
              fill="url(#trend-bar-fill)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 grid shrink-0 grid-cols-2 gap-x-4 gap-y-2 text-xs text-text-muted sm:grid-cols-3 lg:hidden">
        {data.map((d) => (
          <li key={d.key} className="flex items-center justify-between gap-2">
            <span className="font-semibold uppercase tracking-wide">
              {d.label}
            </span>
            <span className="tabular-nums text-text">
              {formatIdr(d.total)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 hidden shrink-0 text-xs text-text-subtle lg:block">
        Total dihitung dari harga yang dinormalisasi ke bulanan
        {data[0]?.monthStart
          ? ` · ${format(parseISO(data[0].key + "-01"), "MMM yyyy")} – ${format(data[data.length - 1]?.monthStart ?? new Date(), "MMM yyyy")}`
          : ""}
      </p>
    </div>
  );
}
