"use client";

import { useState } from "react";
import { differenceInDays, parseISO, startOfDay } from "date-fns";

import type { Subscription } from "@/types/subscription";

import CategoryBadge from "@/components/ui/CategoryBadge";
import SubscriptionDetailModal from "@/components/subscriptions/SubscriptionDetailModal";
import type { Category } from "@/types/subscription";
import { formatIdr } from "@/lib/utils/format-currency";
import { findBrandByName } from "@/lib/brands/brand-registry";

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
  subscription: Subscription;
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
      subscription: sub,
    });
  }

  return rows.sort((a, b) => a.daysUntil - b.daysUntil);
}

export default function UpcomingRenewals({
  subscriptions,
  categories,
  labels,
}: UpcomingRenewalsProps) {
  const [selected, setSelected] = useState<Subscription | null>(null);

  const all = buildRenewals(subscriptions, categories);
  const within7 = all.filter((r) => r.daysUntil >= 0 && r.daysUntil <= 7);
  const within30 = all.filter(
    (r) => r.daysUntil > 7 && r.daysUntil <= 30,
  );

  if (all.length === 0) return null;

  return (
    <div className="rounded-card bg-surface p-6 shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:shadow-lg hover:-translate-y-[2px]">
      <h2 className="font-display text-lg font-bold">{labels.title}</h2>
      {[within7, within30].map(
        (rows, idx) =>
          rows.length > 0 && (
            <div key={idx} className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-text-muted">
                {idx === 0 ? labels.next7Days : labels.next30Days}
              </h3>
              <ul className="flex flex-col gap-2">
                {rows.map((row) => {
                  const daysLabel =
                    row.daysUntil <= 0
                      ? labels.today
                      : labels.daysUntil(row.daysUntil);

                  return (
                    <li
                      key={row.id}
                      onClick={() => setSelected(row.subscription)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelected(row.subscription);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer rounded-[16px] bg-clay-100 px-4 py-3 transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-[1px] hover:bg-clay-200 hover:clay-row-hover active:scale-[0.98] active:clay-row-press"
                    >
                      {/* Mobile: 2 blok — badge atas, nama+harga bawah */}
                      <div className="flex flex-col gap-1.5 sm:hidden">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center">
                            {row.category && (
                              <CategoryBadge
                                name={row.category.name}
                                color={row.category.color}
                              />
                            )}
                          </div>
                          <span
                            className={`shrink-0 rounded-pill bg-surface px-2.5 py-0.5 text-right text-xs font-bold ${daysColor(row.daysUntil)}`}
                          >
                            {daysLabel}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {row.name}
                          </span>
                          <span className="mt-0.5 block text-lg font-bold text-text tabular-nums">
                            {formatIdr(row.price)}
                          </span>
                        </div>
                      </div>

                      {/* Desktop: satu baris */}
                      <div className="hidden items-center justify-between gap-3 sm:flex">
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
                            className={`min-w-[5.5rem] rounded-pill bg-surface px-2.5 py-0.5 text-right text-xs font-bold ${daysColor(row.daysUntil)}`}
                          >
                            {daysLabel}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ),
      )}

      {selected && (
        <SubscriptionDetailModal
          subscription={selected}
          categoryName={categories.find((c) => c.id === selected.category_id)?.name}
          categoryColor={categories.find((c) => c.id === selected.category_id)?.color}
          brandColor={findBrandByName(selected.name)?.color}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
