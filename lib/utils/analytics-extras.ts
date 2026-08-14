import type { Category, Subscription } from "@/types/subscription";
import { normalizeMonthlyPrice } from "@/lib/utils/subscription-math";
import type { CategoryDatum } from "@/lib/utils/analytics";
import { findBrandByName } from "@/lib/brands/brand-registry";

// ---------------------------------------------------------------------------
// Payment method breakdown — Indonesian-first chart that no global tracker
// ships. Distinctive palette so the e-wallet slices don't get confused with
// the category colors used elsewhere on the page.
//
// Self-contained module — re-exported from analytics.ts so consumers can
// keep using `@/lib/utils/analytics` as the single import surface.
// ---------------------------------------------------------------------------

/** Neutral fallback color for payment methods not in the curated palette. */
const PAYMENT_METHOD_FALLBACK_COLOR = "#8C8884";

/**
 * Per-method colors for the common methods. Unknown methods (free-form
 * entries typed by the user) fall back to a neutral gray. Deliberately NOT
 * the brand-accurate e-wallet colors — those would clash with the category
 * palette and the warm design system.
 */
export const PAYMENT_METHOD_COLORS: Record<string, string> = {
  GoPay: "#3D8E7F", // teal-green (distinct from cat "AI Tools" sage)
  OVO: "#7B6BA8", // muted purple
  DANA: "#4A7CA8", // blue (cooler than cat "Productivity")
  ShopeePay: "#D87553", // warm orange (slightly lighter than cat "Streaming")
  QRIS: "#B85A5A", // muted red
  "Kartu Kredit": "#2A2D38", // dark charcoal-blue
  "Kartu Debit": "#5C5A57", // medium gray
  "Transfer Bank": "#9A8E7F", // warm beige
  Lainnya: "#8C8884", // subtle gray
};

/**
 * Build the payment-method pie data. Same shape as the category donut so
 * it can drop straight into `ChartPie`.
 */
export function buildPaymentMethodBreakdown(
  subscriptions: Subscription[],
): CategoryDatum[] {
  const map = new Map<string, CategoryDatum>();
  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trial") continue;
    const value = normalizeMonthlyPrice(
      sub.price,
      sub.billing_cycle,
      sub.custom_cycle_days,
    );
    const method = sub.payment_method.trim() || "Lainnya";
    const existing = map.get(method);
    if (existing) {
      existing.value += value;
    } else {
      map.set(method, {
        name: method,
        value,
        color: PAYMENT_METHOD_COLORS[method] ?? PAYMENT_METHOD_FALLBACK_COLOR,
      });
    }
  }
  return Array.from(map.values())
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

// ---------------------------------------------------------------------------
// Subscription ranking — top N individual subs by normalized monthly cost.
// Each bar is clickable; the chart component navigates to the detail page.
// ---------------------------------------------------------------------------

export type SubscriptionRankingDatum = {
  id: string;
  /** Display name — CSS truncates in the row if it's long. */
  name: string;
  /** Normalized monthly cost in IDR. */
  total: number;
  /** Brand logo URL (Logo.dev) — rendered as a tile like the subscriptions page. */
  logoUrl: string | null;
  /** Brand color, falling back to category color, then neutral. Drives the
   *  logo monogram, the price text and the translucent bar fill — mirrors
   *  `brandColor` on the subscriptions page. */
  color: string;
};

/**
 * Build the ranking dataset: active + trial subs sorted by normalized
 * monthly cost, descending, capped at `limit` (default 7).
 *
 * Color + logo follow the subscriptions-page pattern (`findBrandByName` →
 * brand color; `sub.logo_url` → logo tile) so the chart looks like the
 * subscription list, not like a generic bar chart.
 *
 * `paused` subs are excluded — the user isn't being charged for them, so
 * they don't belong on a "what's eating my money" chart. Cancelled subs
 * obviously excluded too.
 */
export function buildSubscriptionRanking(
  subscriptions: Subscription[],
  categories: Category[],
  limit = 7,
): SubscriptionRankingDatum[] {
  const rows: SubscriptionRankingDatum[] = [];
  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trial") continue;
    const brand = findBrandByName(sub.name);
    const catColor = categories.find((c) => c.id === sub.category_id)?.color;
    const monthly = normalizeMonthlyPrice(
      sub.price,
      sub.billing_cycle,
      sub.custom_cycle_days,
    );
    rows.push({
      id: sub.id,
      name: sub.name,
      total: Math.round(monthly),
      logoUrl: sub.logo_url,
      color: brand?.color ?? catColor ?? "#8C8884",
    });
  }
  rows.sort((a, b) => b.total - a.total);
  return rows.slice(0, limit);
}
