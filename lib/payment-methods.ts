/**
 * Payment methods are free-form strings — the user types their own method
 * (e.g. "PayPal", "Kartu Kredit BCA") in Settings and the subscription form.
 * These lists are only quick-pick suggestions, not an exhaustive enum.
 */

/** Common quick-pick suggestions shown when typing a payment method. */
export const STANDARD_PAYMENT_METHODS = [
  "GoPay",
  "OVO",
  "DANA",
  "ShopeePay",
  "QRIS",
  "Transfer Bank",
  "Kartu Kredit",
  "Kartu Debit",
  "Lainnya",
] as const;

/** Default favorite methods — the pinned quick options. */
export const DEFAULT_PAYMENT_METHODS = [
  "GoPay",
  "OVO",
  "DANA",
  "ShopeePay",
  "QRIS",
  "Transfer Bank",
] as const;
