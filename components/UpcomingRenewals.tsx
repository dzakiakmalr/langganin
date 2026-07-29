import { differenceInDays, parseISO, startOfDay } from "date-fns";

import type { Subscription } from "@/types/subscription";

import CategoryBadge from "@/components/CategoryBadge";
import type { Category } from "@/types/subscription";
import { formatIdr } from "@/lib/utils/format-currency";

type UpcomingRenewalsProps = {
  subscriptions: Subscription[];
  categories: Category[];
  labels: {
    title: string;
    next7Days: string;
    next30Days: string;
    today: string;
    daysUntil: (count: number) => string;
  };
};

type RenewalRow = {
  id: string;
  name: string;
  category: Category | undefined;
  price: number;
  daysUntil: number;
};

function daysColor(days: number): string {
  if (days <= 0) return "text-danger";
  if (days <= 3) return "text-danger";
  if (days <= 7) return "text-warning";
  return "text-success";
}

function getRenewalDate(sub: Subscription): Date {
  if (sub.status === "trial" && sub.trial_end_date) {
    return startOfDay(parseISO(sub.trial_end_date));
  }
  return startOfDay(parseISO(sub.next_billing_date));
}

function buildRenewals(
  subs: Subscription[],
  cats: Category[],
): RenewalRow[] {
  const today = startOfDay(new Date());

  const rows: RenewalRow[] = [];

  for (const sub of subs) {
    if (sub.status !== "active" && sub.status !== "trial") continue;
    const date = getRenewalDate(sub);
    const days = differenceInDays(date, today);
    rows.push({
      id: sub.id,
      name: sub.name,
      category: cats.find((c) => c.id === sub.category_id),
      price: sub.price,
      daysUntil: days,
    });
  }

  return rows.sort((a, b) => a.daysUntil - b.daysUntil);
}

export default function UpcomingRenewals({
  subscriptions,
  categories,
  labels,
}: UpcomingRenewalsProps) {
  const all = buildRenewals(subscriptions, categories);
  const within7 = all.filter((r) => r.daysUntil >= 0 && r.daysUntil <= 7);
  const within30 = all.filter(
    (r) => r.daysUntil > 7 && r.daysUntil <= 30,
  );

  if (all.length === 0) return null;

  return (
    <div className="rounded-card clay-gradient p-6 clay-card transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-[2px]">
      <h2 className="font-display text-lg font-bold">{labels.title}</h2>
      {[within7, within30].map(
        (rows, idx) =>
          rows.length > 0 && (
            <div key={idx} className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-text-muted">
                {idx === 0 ? labels.next7Days : labels.next30Days}
              </h3>
              <ul className="flex flex-col gap-2">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className="flex cursor-default items-center justify-between gap-3 rounded-[16px] bg-white/20 px-4 py-3 transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-[1px] hover:bg-white/30 hover:clay-row-hover active:scale-[0.98] active:clay-row-press"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="truncate text-sm font-medium">
                        {row.name}
                      </span>
                      {row.category && (
                        <CategoryBadge
                          name={row.category.name}
                          color={row.category.color}
                        />
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3 tabular-nums">
                      <span className="text-base font-semibold text-text">
                        {formatIdr(row.price)}
                      </span>
                      <span
                        className={`min-w-[5.5rem] rounded-pill bg-clay-surface/60 px-2.5 py-0.5 text-right text-xs font-bold ${daysColor(row.daysUntil)}`}
                      >
                        {row.daysUntil <= 0
                          ? labels.today
                          : labels.daysUntil(row.daysUntil)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ),
      )}
    </div>
  );
}
