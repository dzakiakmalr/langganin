import {
  addMonths,
  differenceInDays,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  startOfDay,
} from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";

import type { Category, Subscription } from "@/types/subscription";
import { normalizeMonthlyPrice } from "@/lib/utils/subscription-math";
import { findBrandByName } from "@/lib/brands/brand-registry";

// Re-export the newer chart builders so consumers can keep importing
// everything from `@/lib/utils/analytics` (single import surface).
export {
  PAYMENT_METHOD_COLORS,
  buildPaymentMethodBreakdown,
  buildSubscriptionRanking,
} from "@/lib/utils/analytics-extras";
export type {
  SubscriptionRankingDatum,
} from "@/lib/utils/analytics-extras";

// ---------------------------------------------------------------------------
// Pure helpers powering the Analytics page.
// Keep them dependency-free (no DB, no React) so they can be unit-tested
// and reused from server-side pre-rendering later.
// ---------------------------------------------------------------------------

export type Locale = "id" | "en";

export type CategoryDatum = {
  name: string;
  value: number;
  color: string;
};

/** Build the donut chart data for the current month. */
export function buildCategoryDonut(
  subscriptions: Subscription[],
  categories: Category[],
): CategoryDatum[] {
  const map = new Map<string, CategoryDatum>();
  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trial") continue;
    const cat = categories.find((c) => c.id === sub.category_id);
    if (!cat?.color) continue;
    const value = normalizeMonthlyPrice(
      sub.price,
      sub.billing_cycle,
      sub.custom_cycle_days,
    );
    const existing = map.get(cat.id);
    if (existing) {
      existing.value += value;
    } else {
      map.set(cat.id, { name: cat.name, value, color: cat.color });
    }
  }
  return Array.from(map.values())
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export type TrendDatum = {
  /** YYYY-MM key for stable rendering. */
  key: string;
  /** Locale-aware month label, e.g. "Agu" / "Aug". */
  label: string;
  /** Sum of normalized monthly spend for that month. */
  total: number;
  /** First day of the month — useful for sorting and tooltips. */
  monthStart: Date;
};

/**
 * Last N months (inclusive of current month) of normalized spend.
 * For each month, sum the monthly cost of subscriptions that were
 * active during that month.
 *
 * TODO(backend): replace with a `subscription_events` aggregation once
 * the DB layer lands — see 06-API-CONTRACT.md. Current rule:
 *   active-in-month(M) = start_date <= endOfMonth(M) AND status != cancelled
 */
export function buildMonthlyTrend(
  subscriptions: Subscription[],
  monthsBack = 6,
  locale: Locale = "id",
): TrendDatum[] {
  const today = startOfDay(new Date());
  const currentMonthStart = startOfMonth(today);
  const monthStarts: Date[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    monthStarts.push(startOfMonth(addMonths(currentMonthStart, -i)));
  }

  const dfLocale = locale === "id" ? idLocale : enUS;

  return monthStarts.map((monthStart) => {
    const monthEnd = endOfMonth(monthStart);
    let total = 0;
    for (const sub of subscriptions) {
      if (sub.status === "cancelled") continue;
      const start = parseISO(sub.start_date);
      if (start > monthEnd) continue;
      total += normalizeMonthlyPrice(
        sub.price,
        sub.billing_cycle,
        sub.custom_cycle_days,
      );
    }
    return {
      key: format(monthStart, "yyyy-MM"),
      label: format(monthStart, "MMM", { locale: dfLocale }),
      total: Math.round(total),
      monthStart,
    };
  });
}

export type InsightValue = {
  count: number;
  total: number;
  names: string[];
  /** Per-item brand identity (logo + color) + id for navigation — lets the
   *  insight card render a logo row like the subscriptions list. */
  items: {
    id: string;
    name: string;
    logoUrl: string | null;
    color: string;
  }[];
};

export type InsightPayload = {
  trials: InsightValue;
  topCategory: { name: string; total: number } | null;
  mostExpensive: {
    name: string;
    total: number;
    logoUrl: string | null;
    /** Brand color (fallback: category color, then neutral) — used by the
     *  insight card's logo tile + price tint, mirroring the subscriptions page. */
    color: string;
  } | null;
  upcoming: InsightValue;
};

/**
 * Rule-based insights — all derived locally from the same context the
 * charts use. No network, no LLM. Future Phase 4 work can replace these
 * with smarter rules (e.g. "hasn't been used in 30 days") once usage
 * tracking exists.
 */
export function buildInsights(
  subscriptions: Subscription[],
  categories: Category[],
  now: Date = startOfDay(new Date()),
): InsightPayload {
  const brandIdentity = (sub: Subscription) => {
    const brand = findBrandByName(sub.name);
    const catColor = categories.find((c) => c.id === sub.category_id)?.color;
    return {
      id: sub.id,
      name: sub.name,
      logoUrl: sub.logo_url,
      color: brand?.color ?? catColor ?? "#8C8884",
    };
  };

  // Trials ending in next 7 days (based on trial_end_date).
  const trials: InsightValue = { count: 0, total: 0, names: [], items: [] };
  for (const sub of subscriptions) {
    if (sub.status !== "trial" || !sub.trial_end_date) continue;
    const end = parseISO(sub.trial_end_date);
    const days = differenceInDays(end, now);
    if (days < 0 || days > 7) continue;
    trials.count += 1;
    trials.total += sub.price;
    trials.names.push(sub.name);
    trials.items.push(brandIdentity(sub));
  }

  // Upcoming renewals in next 7 days.
  const upcoming: InsightValue = { count: 0, total: 0, names: [], items: [] };
  for (const sub of subscriptions) {
    if (sub.status === "cancelled" || sub.status === "paused") continue;
    const date =
      sub.status === "trial" && sub.trial_end_date
        ? parseISO(sub.trial_end_date)
        : parseISO(sub.next_billing_date);
    const days = differenceInDays(date, now);
    if (days < 0 || days > 7) continue;
    upcoming.count += 1;
    upcoming.total += sub.price;
    upcoming.names.push(sub.name);
    upcoming.items.push(brandIdentity(sub));
  }

  // Top category this month (by normalized sum).
  const donut = buildCategoryDonut(subscriptions, categories);
  const topCategory =
    donut.length > 0 && donut[0]
      ? { name: donut[0].name, total: donut[0].value }
      : null;

  // Most expensive single subscription by normalized monthly price.
  let mostExpensive: InsightPayload["mostExpensive"] = null;
  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trial") continue;
    const monthly = normalizeMonthlyPrice(
      sub.price,
      sub.billing_cycle,
      sub.custom_cycle_days,
    );
    if (!mostExpensive || monthly > mostExpensive.total) {
      const brand = findBrandByName(sub.name);
      const catColor = categories.find((c) => c.id === sub.category_id)?.color;
      mostExpensive = {
        name: sub.name,
        total: monthly,
        logoUrl: sub.logo_url,
        color: brand?.color ?? catColor ?? "#8C8884",
      };
    }
  }

  return { trials, topCategory, mostExpensive, upcoming };
}
