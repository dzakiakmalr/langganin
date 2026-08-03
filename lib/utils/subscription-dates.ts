import { parseISO, startOfDay } from "date-fns";

import type { Subscription } from "@/types/subscription";

/**
 * The single date that matters for a subscription: when the next charge
 * (or trial end) hits. Every UI surface that needs this — list rows,
 * calendar cells, dashboard cards — must go through this function so
 * the rule "trial_end for trials, next_billing otherwise" lives in one
 * place (AGENTS.md §2 — never duplicate date/billing-cycle logic).
 */
export function getRelevantDate(sub: Subscription): Date {
  if (sub.status === "trial" && sub.trial_end_date) {
    return startOfDay(parseISO(sub.trial_end_date));
  }
  return startOfDay(parseISO(sub.next_billing_date));
}
