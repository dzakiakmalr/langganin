"use client";

import { useTranslations } from "next-intl";

import ChartCard from "@/components/ChartCard";
import ChartPie from "@/components/ChartPie";
import EmptyState from "@/components/EmptyState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import SummaryCard from "@/components/SummaryCard";
import UpcomingRenewals from "@/components/UpcomingRenewals";
import MiniCalendar from "@/components/MiniCalendar";
import { useSubscriptions } from "@/components/SubscriptionsProvider";

import { formatIdr } from "@/lib/utils/format-currency";
import { normalizeMonthlyPrice } from "@/lib/utils/subscription-math";

// TODO(backend): replace with real query — see 06-API-CONTRACT.md
const MOCK_PREV_MONTH = 600000;

export default function DashboardClient() {
  const t = useTranslations("Dashboard");
  const { subscriptions, categories } = useSubscriptions();

  // ── Dev toggles (temporary — leave `false` on commit) ─────────────────
  const SHOW_SKELETON = false;
  const SHOW_EMPTY = false;

  if (SHOW_SKELETON) {
    return <LoadingSkeleton />;
  }

  if (SHOW_EMPTY || subscriptions.length === 0) {
    return (
      <EmptyState
        message={t("noSubscriptions")}
        actionLabel={t("addYourFirst")}
      />
    );
  }

  // ── Compute stats ─────────────────────────────────────────────────────
  const activeAndTrial = subscriptions.filter(
    (s) => s.status === "active" || s.status === "trial",
  );
  const activeCount = subscriptions.filter(
    (s) => s.status === "active",
  ).length;

  const monthlyTotal = activeAndTrial.reduce(
    (sum, s) =>
      sum +
      normalizeMonthlyPrice(s.price, s.billing_cycle, s.custom_cycle_days),
    0,
  );
  const yearlyTotal = monthlyTotal * 12;

  // TODO(backend): replace with real previous-month total — see 06-API-CONTRACT.md
  const deltaPercent = Math.round(
    ((monthlyTotal - MOCK_PREV_MONTH) / MOCK_PREV_MONTH) * 100,
  );
  const deltaUp = deltaPercent > 0;

  // Category chart data
  const categoryMap = new Map<
    string,
    { name: string; value: number; color: string }
  >();
  for (const sub of activeAndTrial) {
    const cat = categories.find((c) => c.id === sub.category_id);
    if (!cat?.color) continue;
    const normalized = normalizeMonthlyPrice(
      sub.price,
      sub.billing_cycle,
      sub.custom_cycle_days,
    );
    const existing = categoryMap.get(cat.id);
    if (existing) {
      existing.value += normalized;
    } else {
      categoryMap.set(cat.id, {
        name: cat.name,
        value: normalized,
        color: cat.color,
      });
    }
  }
  const chartData = Array.from(categoryMap.values()).filter(
    (d) => d.value > 0,
  );

  const renewalsLabels = {
    title: t("upcomingRenewals"),
    next7Days: t("next7Days"),
    next30Days: t("next30Days"),
    today: t("today"),
    daysUntil: (n: number) => t("daysUntil", { count: n }),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">
          {t("greeting", { name: "Dzaki" })}
        </h1>
        <div className="flex items-center gap-3">
          <span className="tabular-nums">
            <span className="font-display text-2xl font-bold text-text">
              {formatIdr(monthlyTotal)}
            </span>
            <span className="text-sm text-text-muted"> / bulan</span>
          </span>
          {deltaPercent !== 0 && (
            <span
              className={`rounded-pill px-2 py-0.5 text-xs font-semibold ${
                deltaUp ? "text-warning" : "text-success"
              }`}
            >
              {t("vsLastMonth", {
                direction: deltaUp ? "↑" : "↓",
                percent: deltaPercent,
              })}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title={t("monthlyTotal")}
          value={formatIdr(Math.round(monthlyTotal))}
        />
        <SummaryCard
          title={t("projectedYearly")}
          value={formatIdr(Math.round(yearlyTotal))}
        />
        <SummaryCard
          title={t("activeSubscriptions")}
          value={String(activeCount)}
        />
      </div>

      <MiniCalendar subscriptions={subscriptions} categories={categories} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingRenewals
          subscriptions={subscriptions}
          categories={categories}
          labels={renewalsLabels}
        />
        {chartData.length > 0 && (
          <ChartCard title={t("spendByCategory")}>
            <ChartPie data={chartData} />
          </ChartCard>
        )}
      </div>
    </div>
  );
}
