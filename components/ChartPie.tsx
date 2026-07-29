"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatIdr } from "@/lib/utils/format-currency";

type ChartDatum = {
  name: string;
  value: number;
  color: string;
};

type ChartPieProps = {
  data: ChartDatum[];
};

export default function ChartPie({ data }: ChartPieProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <defs>
            <filter id="donut-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="2"
                dy="4"
                stdDeviation="6"
                floodColor="rgba(180,120,90,0.2)"
              />
            </filter>
          </defs>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={45}
            paddingAngle={3}
            filter="url(#donut-shadow)"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(value as number)
            }
            contentStyle={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(16px) saturate(140%)",
              WebkitBackdropFilter: "blur(16px) saturate(140%)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.4)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              color: "#2B2420",
              fontSize: "13px",
              fontWeight: 500,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 space-y-2.5">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div
              key={d.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="truncate text-text">{d.name}</span>
              </div>
              <span className="ml-3 shrink-0 text-right tabular-nums">
                <span className="font-semibold text-text">{formatIdr(d.value)}</span>
                <span className="ml-1.5 rounded-pill bg-clay-surface/60 px-1.5 py-0.5 text-xs text-text-muted">
                  {pct}%
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
