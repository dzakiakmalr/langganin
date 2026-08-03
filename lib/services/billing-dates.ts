import { addDays, addMonths, addWeeks, addYears, format } from "date-fns";

import type { BillingCycle } from "@/types/subscription";

/**
 * Pure date-calculation helpers — no DB, no network, no side effects.
 * These run on the server later verbatim; the client uses them now
 * for instant feedback in the form before submit.
 */

export function calculateNextBillingDate(
  startDate: string, // YYYY-MM-DD
  billingCycle: BillingCycle,
  customCycleDays?: number | null,
): string {
  const d = new Date(startDate + "T00:00:00");

  switch (billingCycle) {
    case "weekly":
      return format(addWeeks(d, 1), "yyyy-MM-dd");
    case "monthly":
      return format(addMonths(d, 1), "yyyy-MM-dd");
    case "yearly":
      return format(addYears(d, 1), "yyyy-MM-dd");
    case "custom_days":
      return format(addDays(d, customCycleDays ?? 30), "yyyy-MM-dd");
    default:
      return format(addMonths(d, 1), "yyyy-MM-dd");
  }
}

export function calculateTrialEndDate(
  trialStartDate: string, // YYYY-MM-DD
  trialDurationDays: number,
): string {
  return format(
    addDays(new Date(trialStartDate + "T00:00:00"), trialDurationDays),
    "yyyy-MM-dd",
  );
}
