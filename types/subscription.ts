/**
 * Canonical types for the subscription domain, mirrored from 06-API-CONTRACT.md.
 * Every mock, form, and query throughout the app references these shapes.
 */

export type BillingCycle = "weekly" | "monthly" | "yearly" | "custom_days";

export type SubscriptionStatus = "active" | "trial" | "paused" | "cancelled";

export type TrialDurationUnit = "days" | "months" | "years";

/** Days a "cancelled" (recently-deleted) subscription is kept before auto-purge. */
export const DELETED_RETENTION_DAYS = 14;

export type Subscription = {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  logo_url: string | null;
  price: number;
  currency: string;
  billing_cycle: BillingCycle;
  custom_cycle_days: number | null;
  start_date: string; // YYYY-MM-DD
  next_billing_date: string; // YYYY-MM-DD
  status: SubscriptionStatus;
  is_trial: boolean;
  trial_start_date: string | null;
  trial_end_date: string | null;
  trial_duration: number | null;
  trial_duration_unit: TrialDurationUnit;
  payment_method: string;
  notes: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  /** Set when the subscription is soft-deleted ("cancelled" status). */
  deleted_at: string | null;
};

export type Category = {
  id: string;
  user_id: string | null; // null = global default
  name: string;
  icon: string | null; // lucide-react icon name
  color: string | null; // hex color (used by charts)
};
