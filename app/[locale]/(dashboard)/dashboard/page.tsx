import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import SummaryCard from "@/components/SummaryCard";
import UpcomingRenewals from "@/components/UpcomingRenewals";
import ChartCard from "@/components/ChartCard";
import ChartPie from "@/components/ChartPie";
import EmptyState from "@/components/EmptyState";
import LoadingSkeleton from "@/components/LoadingSkeleton";

import {
  mockCategories,
  mockPreviousMonthTotal,
  mockSubscriptions,
} from "@/lib/mock/subscriptions";
import { formatIdr } from "@/lib/utils/format-currency";
import { normalizeMonthlyPrice } from "@/lib/utils/subscription-math";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  return { title: t("title") };
}

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Dashboard" });

  // ── Dev toggles (temporary — leave `false` on commit) ─────────────────
  // Flip to true to verify loading / empty state visuals.
  const SHOW_SKELETON = false;
  const SHOW_EMPTY = false;

  if (SHOW_SKELETON) {
    // Artificial delay so the pulse animation is visible.
    // TODO(backend): remove once real async queries exist.
    await new Promise((r) => setTimeout(r, 400));
    return <LoadingSkeleton />;
  }

  // TODO(backend): replace with real query — see 06-API-CONTRACT.md
  const subscriptions = mockSubscriptions;
  const categories = mockCategories;

  if (SHOW_EMPTY || subscriptions.length === 0) {
    return (
      <EmptyState
        message={t("noSubscriptions")}
        actionLabel={t("addYourFirst")}
      />
    );
  }

  // ── Compute stats from mock data ───────────────────────────────────────
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

  // Hero delta vs previous month
  // TODO(backend): replace with a real previous-month total once
  // subscription_events exists — see 06-API-CONTRACT.md
  const prevTotal = mockPreviousMonthTotal;
  const deltaPercent = Math.round(
    ((monthlyTotal - prevTotal) / prevTotal) * 100,
  );
  const deltaUp = deltaPercent > 0;

  // Chart data — aggregate per category, skip categories with zero spend
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
      {/* Hero greeting + monthly total + delta badge */}
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

      {/* Summary cards */}
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

      {/* Renewals + chart */}
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
