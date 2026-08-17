"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  CalendarClock,
  Crown,
  Plus,
  Sparkles,
} from "lucide-react";

import AnalyticsCharts from "@/components/analytics/AnalyticsCharts";
import ChatPanel from "@/components/chat/ChatPanel";
import InsightCard from "@/components/analytics/InsightCard";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import MobileTabSwitcher, {
  type MobileTab,
} from "@/components/ui/MobileTabSwitcher";
import SummaryCard from "@/components/dashboard/SummaryCard";
import { useSubscriptions } from "@/components/subscriptions/SubscriptionsProvider";
import {
  buildCategoryDonut,
  buildInsights,
  buildMonthlyTrend,
  buildPaymentMethodBreakdown,
  buildSubscriptionRanking,
  type Locale,
} from "@/lib/utils/analytics";
import { formatIdr } from "@/lib/utils/format-currency";
import { normalizeMonthlyPrice } from "@/lib/utils/subscription-math";
import { Link } from "@/i18n/navigation";

// ── Dev toggles (temporary — leave `false` on commit) ─────────────────
const SHOW_SKELETON = false;
const SHOW_EMPTY = false;

export default function AnalyticsClient() {
  const t = useTranslations("Analytics");
  const locale = useLocale();
  const { subscriptions, categories } = useSubscriptions();
  const [mobileTab, setMobileTab] = useState<MobileTab>("summary");

  // ── Derived data — all hooks MUST run on every render, before any
  //    early-return guards below (Rules of Hooks).
  const activeOrTrial = useMemo(
    () =>
      subscriptions.filter((s) => s.status === "active" || s.status === "trial"),
    [subscriptions],
  );

  const monthlyTotal = useMemo(
    () =>
      activeOrTrial.reduce(
        (sum, s) =>
          sum +
          normalizeMonthlyPrice(s.price, s.billing_cycle, s.custom_cycle_days),
        0,
      ),
    [activeOrTrial],
  );
  const yearlyTotal = monthlyTotal * 12;
  const activeCount = useMemo(
    () => subscriptions.filter((s) => s.status === "active").length,
    [subscriptions],
  );

  const donutData = useMemo(
    () => buildCategoryDonut(subscriptions, categories),
    [subscriptions, categories],
  );
  const trendData = useMemo(
    () => buildMonthlyTrend(subscriptions, 6, locale as Locale),
    [subscriptions, locale],
  );
  const paymentData = useMemo(
    () => buildPaymentMethodBreakdown(subscriptions),
    [subscriptions],
  );
  const rankingData = useMemo(
    () => buildSubscriptionRanking(subscriptions, categories),
    [subscriptions, categories],
  );
  const insights = useMemo(
    () => buildInsights(subscriptions, categories),
    [subscriptions, categories],
  );

  // ── Early returns (no hooks below this line) ─────────────────────────
  if (SHOW_SKELETON) {
    return <LoadingSkeleton />;
  }

  if (SHOW_EMPTY || subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl" aria-hidden>
          📊
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-text">
          {t("noDataTitle")}
        </h2>
        <p className="mt-2 max-w-md text-sm text-text-muted">
          {t("noDataDescription")}
        </p>
        <Link
          href="/dashboard/subscriptions"
          className="mt-6 inline-flex items-center gap-2 rounded-pill bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover"
        >
          <Plus size={16} />
          {t("noDataAction")}
        </Link>
      </div>
    );
  }

  // ── Derived labels for the insights row ──────────────────────────────
  const trialsValue =
    insights.trials.count > 0
      ? t("insightTrialsValueNoTotal", { count: insights.trials.count })
      : t("insightTrialsEmpty");
  const trialsSubline =
    insights.trials.count > 0 && insights.trials.total > 0
      ? formatIdr(Math.round(insights.trials.total))
      : insights.trials.names.length > 0
        ? insights.trials.names.join(", ")
        : undefined;

  const upcomingValue =
    insights.upcoming.count > 0
      ? t("insightUpcomingValueNoTotal", { count: insights.upcoming.count })
      : t("insightUpcomingEmpty");
  const upcomingSubline =
    insights.upcoming.count > 0 && insights.upcoming.total > 0
      ? formatIdr(Math.round(insights.upcoming.total))
      : undefined;

  const topCategoryValue = insights.topCategory
    ? insights.topCategory.name
    : t("insightTopCategoryEmpty");
  const topCategorySubline = insights.topCategory
    ? formatIdr(Math.round(insights.topCategory.total))
    : undefined;

  const mostExpensiveValue = insights.mostExpensive
    ? insights.mostExpensive.name
    : t("insightMostExpensiveEmpty");
  const mostExpensiveSubline = insights.mostExpensive
    ? `${formatIdr(Math.round(insights.mostExpensive.total))} / bln`
    : undefined;
  const mostExpensiveLogo = insights.mostExpensive
    ? { src: insights.mostExpensive.logoUrl, color: insights.mostExpensive.color }
    : undefined;

  const chartsProps = {
    donutTitle: t("chartDonutTitle"),
    trendTitle: t("chartTrendTitle"),
    paymentTitle: t("chartPaymentTitle"),
    rankingTitle: t("chartRankingTitle"),
    rankingHint: t("chartRankingHint"),
    donutData,
    trendData,
    paymentData,
    rankingData,
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">
          {t("title")}
        </h1>
      </header>

      {/* ── Summary cards — always visible, full-width row ─────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title={t("summaryMonthly")}
          value={formatIdr(Math.round(monthlyTotal))}
        />
        <SummaryCard
          title={t("summaryYearly")}
          value={formatIdr(Math.round(yearlyTotal))}
        />
        <SummaryCard
          title={t("summaryActive")}
          value={String(activeCount)}
        />
      </div>

      {/* ── Insights — full-width row, sits above the 2-col layout so
              cards get the full content width (~880px on 1280 viewport)
              instead of being cramped inside the chart column. */}
      <section aria-labelledby="analytics-insights-title">
        <h2
          id="analytics-insights-title"
          className="font-display text-lg font-bold text-text"
        >
          {t("insightsTitle")}
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            label={t("insightTrialsLabel")}
            value={trialsValue}
            subline={trialsSubline}
            Icon={AlertTriangle}
            tone={insights.trials.count > 0 ? "warning" : "neutral"}
          />
          <InsightCard
            label={t("insightTopCategoryLabel")}
            value={topCategoryValue}
            subline={topCategorySubline}
            Icon={Sparkles}
            tone="brand"
          />
          <InsightCard
            label={t("insightMostExpensiveLabel")}
            value={mostExpensiveValue}
            subline={mostExpensiveSubline}
            Icon={Crown}
            tone="neutral"
            logo={mostExpensiveLogo}
          />
          <InsightCard
            label={t("insightUpcomingLabel")}
            value={upcomingValue}
            subline={upcomingSubline}
            Icon={CalendarClock}
            tone={insights.upcoming.count > 0 ? "warning" : "neutral"}
            logos={insights.upcoming.items.map((item) => ({
              id: item.id,
              name: item.name,
              src: item.logoUrl,
              color: item.color,
            }))}
          />
        </div>
      </section>

      {/* ── Tab switcher (< xl) — toggles between charts & chat. Also used
             on tablets (lg) so the fixed chat column never squeezes the charts. */}
      <div className="xl:hidden">
        <MobileTabSwitcher value={mobileTab} onChange={setMobileTab} />
      </div>

      {/* ── DESKTOP (xl+): 2 columns — charts + sticky chat ─────────── */}
      <div className="hidden xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)] xl:gap-6 xl:items-start">
        <AnalyticsCharts {...chartsProps} />
        <div className="sticky top-20 h-[calc(100vh-6rem)]">
          <ChatPanel
            subscriptions={subscriptions}
            categories={categories}
          />
        </div>
      </div>

      {/* ── TABLET/MOBILE (< xl): tab-gated panels, each owns its scroll */}
      <div className="xl:hidden">
        {mobileTab === "summary" ? (
          <div
            id="analytics-tab-panel-summary"
            role="tabpanel"
            className="min-h-[calc(100dvh-12rem)]"
          >
            <AnalyticsCharts {...chartsProps} />
          </div>
        ) : (
          <div
            id="analytics-tab-panel-chat"
            role="tabpanel"
            className="h-[calc(100dvh-12rem)] min-h-[500px]"
          >
            <ChatPanel
              subscriptions={subscriptions}
              categories={categories}
            />
          </div>
        )}
      </div>
    </div>
  );
}
