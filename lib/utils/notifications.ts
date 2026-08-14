import { differenceInDays, format, startOfDay } from "date-fns";

import type { Category, Subscription } from "@/types/subscription";
import type {
  AppNotification,
  ReminderPreferences,
} from "@/types/notifications";
import { getRelevantDate } from "@/lib/utils/subscription-dates";

/** Sensible default: H-7, H-3, H-1 for renewals and trial ends. Email only. */
export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  global: {
    daysBefore: [7, 3, 1],
    trialDaysBefore: [7, 3, 1],
    channels: ["email"],
  },
  perSubscription: {},
};

/**
 * Pure function — scans the user's subscriptions, applies the reminder
 * preferences, and produces a sorted list of notifications.
 *
 * A notification is generated when:
 *   - the subscription is active or trial (paused/cancelled → no reminders)
 *   - the event date is today or in the future (overdue → not shown)
 *   - today is at or past (event - daysBefore) for some daysBefore in the prefs
 *
 * Sorted by daysUntilEvent ascending (most urgent first), then by
 * daysBefore descending (H-1 before H-3 before H-7 for the same event).
 */
export function generateNotifications(
  subscriptions: Subscription[],
  preferences: ReminderPreferences,
  categories: Category[],
  now: Date = new Date(),
): AppNotification[] {
  const today = startOfDay(now);
  const result: AppNotification[] = [];

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trial") continue;

    const override = preferences.perSubscription[sub.id];
    const isTrial = sub.status === "trial";
    // Trials remind before trial end; active subs remind before renewal.
    const daysBeforeList = isTrial
      ? override?.trialDaysBefore ?? preferences.global.trialDaysBefore
      : override?.daysBefore ?? preferences.global.daysBefore;
    if (daysBeforeList.length === 0) continue;

    const eventDate = startOfDay(getRelevantDate(sub));
    const daysUntilEvent = differenceInDays(eventDate, today);
    if (daysUntilEvent < 0) continue; // event has passed

    const type: AppNotification["type"] = isTrial ? "trial_end" : "renewal";
    const categoryColor =
      categories.find((c) => c.id === sub.category_id)?.color ?? null;

    for (const d of daysBeforeList) {
      // Fire when today is at or after (event - d)
      if (daysUntilEvent <= d) {
        const firesOn = format(
          new Date(eventDate.getTime() - d * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd",
        );
        result.push({
          id: `${sub.id}#${d}`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          categoryColor,
          daysBefore: d,
          firesOn,
          type,
          daysUntilEvent,
          read: false,
        });
      }
    }
  }

  return result.sort((a, b) => {
    if (a.daysUntilEvent !== b.daysUntilEvent) {
      return a.daysUntilEvent - b.daysUntilEvent;
    }
    return b.daysBefore - a.daysBefore;
  });
}

/** Pretty-print how long ago a notification fired (or "today" / "just now"). */
export function relativeTime(firesOn: string, now: Date = new Date()): string {
  const fires = startOfDay(new Date(firesOn));
  const today = startOfDay(now);
  const diff = differenceInDays(today, fires);
  if (diff <= 0) return "today";
  if (diff === 1) return "yesterday";
  return `${diff}d ago`;
}
