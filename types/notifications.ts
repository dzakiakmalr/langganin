/**
 * Notification domain types.
 *
 * Notifications are pure client-side/computed — they're not stored in any
 * database. The user configures their reminder preferences (which H- days
 * + which channels), and the bell + dropdown are populated by re-scanning
 * the subscriptions on every Context state change.
 *
 * Channel preferences for now are saved-but-no-action-yet: the actual
 * WhatsApp / Email / Google Calendar delivery is a later phase.
 */

export type NotificationChannel = "whatsapp" | "email" | "google_calendar";

/** All available channels, in display order. */
export const NOTIFICATION_CHANNELS: readonly NotificationChannel[] = [
  "whatsapp",
  "email",
  "google_calendar",
] as const;

/**
 * The "fixed" H- options shown as default chips in the picker. These are
 * just suggestions — the user can toggle any of them off and add any
 * custom integer via the "+ Kustom" input.
 */
export const FIXED_DAYS_BEFORE = [7, 3, 1, 0] as const;

/** All possible H- values, including custom integers the user types. */
export type DaysBefore = number;

/** Inclusive bounds for the custom H- input. */
export const MIN_DAYS_BEFORE = 0;
export const MAX_DAYS_BEFORE = 60;

/** The shape of a single subscription's override (or null = use global). */
export type SubscriptionOverride = {
  /** H- days before a renewal (active subscriptions). */
  daysBefore: DaysBefore[];
  /** H- days before a trial ends (trial subscriptions). */
  trialDaysBefore: DaysBefore[];
  channels: NotificationChannel[];
};

export type ReminderPreferences = {
  /** The default H- days + channels for any subscription that hasn't overridden. */
  global: SubscriptionOverride;
  /** Map of subscription.id → override. null = use global. */
  perSubscription: Record<string, SubscriptionOverride | null>;
};

/** A computed notification entry. NOT persisted — derived from prefs + subs. */
export type AppNotification = {
  /** Composite id: `${subscriptionId}#${daysBefore}` so we can dedupe + read-track. */
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  /** Subscription's category color (for the dot/marker). null = no category. */
  categoryColor: string | null;
  /** Which H- window this notification belongs to. */
  daysBefore: DaysBefore;
  /** The day the notification fires = eventDate - daysBefore. */
  firesOn: string; // YYYY-MM-DD
  type: "renewal" | "trial_end";
  /** 0 = today, 1 = tomorrow, etc. Negative = overdue (we don't show those). */
  daysUntilEvent: number;
  /** Has the user marked this notification as read? Derived state. */
  read: boolean;
};
