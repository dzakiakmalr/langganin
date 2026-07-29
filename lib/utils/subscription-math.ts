import type { BillingCycle } from "@/types/subscription";

/**
 * Normalize a subscription's price to its equivalent monthly cost.
 * Never duplicate this logic — every "monthly spend" summary
 * throughout the app routes through this one function.
 */
export function normalizeMonthlyPrice(
  price: number,
  billingCycle: BillingCycle,
  customCycleDays?: number | null,
): number {
  switch (billingCycle) {
    case "weekly":
      return (price * 52) / 12;
    case "monthly":
      return price;
    case "yearly":
      return price / 12;
    case "custom_days":
      return customCycleDays ? (price * 365) / customCycleDays / 12 : price;
    default:
      return price;
  }
}
