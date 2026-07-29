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
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={45}
            paddingAngle={3}
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
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#F5EEE3",
              color: "#2B2420",
              fontSize: "13px",
              fontWeight: 500,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Chart legend — each item: colour dot + name + amount + percentage */}
      <div className="mt-4 space-y-1.5">
        {data.map((d) => {
          const pct =
            total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div
              key={d.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="truncate text-text">{d.name}</span>
              </div>
              <span className="ml-3 shrink-0 text-right tabular-nums text-text-muted">
                {formatIdr(d.value)}
                <span className="ml-1 text-xs opacity-70">· {pct}%</span>
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
