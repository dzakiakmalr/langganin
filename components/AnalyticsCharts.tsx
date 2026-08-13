"use client";

import ChartCard from "@/components/ChartCard";
import ChartMonthlyTrend from "@/components/ChartMonthlyTrend";
import ChartPie from "@/components/ChartPie";
import ChartSubscriptionRanking from "@/components/ChartSubscriptionRanking";
import type {
  buildCategoryDonut,
  buildMonthlyTrend,
  buildPaymentMethodBreakdown,
  buildSubscriptionRanking,
} from "@/lib/utils/analytics";

// ---------------------------------------------------------------------------
// AnalyticsCharts — the four-chart grid (donut, trend, payment, ranking).
//
// Shared between the desktop 2-column layout and the mobile "Ringkasan"
// tab. Pure layout, no state.
//
// Order on desktop (2×2 grid):
//   ┌───────────────┬───────────────┐
//   │ Spend by Cat  │ 6-mo Trend    │
//   ├───────────────┼───────────────┤
//   │ Payment Meth. │ Top Subs      │
//   └───────────────┴───────────────┘
// Each chart is conditionally rendered when its dataset has data.
// ---------------------------------------------------------------------------

type AnalyticsChartsProps = {
  donutTitle: string;
  trendTitle: string;
  paymentTitle: string;
  rankingTitle: string;
  rankingHint: string;
  donutData: ReturnType<typeof buildCategoryDonut>;
  trendData: ReturnType<typeof buildMonthlyTrend>;
  paymentData: ReturnType<typeof buildPaymentMethodBreakdown>;
  rankingData: ReturnType<typeof buildSubscriptionRanking>;
};

export default function AnalyticsCharts({
  donutTitle,
  trendTitle,
  paymentTitle,
  rankingTitle,
  rankingHint,
  donutData,
  trendData,
  paymentData,
  rankingData,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {donutData.length > 0 && (
        <ChartCard title={donutTitle}>
          <ChartPie data={donutData} />
        </ChartCard>
      )}
      <ChartCard title={trendTitle} fill>
        <ChartMonthlyTrend data={trendData} />
      </ChartCard>
      {paymentData.length > 0 && (
        <ChartCard title={paymentTitle}>
          <ChartPie data={paymentData} />
        </ChartCard>
      )}
      {rankingData.length > 0 && (
        <ChartCard title={rankingTitle} fill>
          <ChartSubscriptionRanking
            data={rankingData}
            hintLabel={rankingHint}
          />
        </ChartCard>
      )}
    </div>
  );
}
