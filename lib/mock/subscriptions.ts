import { addDays, format, startOfDay } from "date-fns";

import type { Category, Subscription } from "@/types/subscription";

const today = startOfDay(new Date());
const iso = (d: Date) => d.toISOString();

// ---------------------------------------------------------------------------
// Categories (global defaults — seed colours pulled from the design tokens
// in 04-DESIGN-SYSTEM.md §2 so the chart doesn't need hardcoded fills)
// ---------------------------------------------------------------------------

export const mockCategories: Category[] = [
  {
    id: "cat-streaming",
    user_id: null,
    name: "Streaming",
    icon: "tv",
    color: "#E08B6F",
  },
  {
    id: "cat-ai",
    user_id: null,
    name: "AI Tools",
    icon: "bot",
    color: "#6FA287",
  },
  {
    id: "cat-music",
    user_id: null,
    name: "Music",
    icon: "music",
    color: "#C77B1E",
  },
  {
    id: "cat-ecommerce",
    user_id: null,
    name: "E-commerce Membership",
    icon: "shopping-cart",
    color: "#A89A8C",
  },
  {
    id: "cat-productivity",
    user_id: null,
    name: "Productivity",
    icon: "briefcase",
    color: "#6E8FA3",
  },
];

// ---------------------------------------------------------------------------
// Subscriptions — 7 entries covering the required state mix.
//
// Relative dates are computed at load time with date-fns so the
// "upcoming renewals" logic always has real data to filter, not
// hardcoded past dates (AGENTS.md §2 rule).
//
// Type annotation maps field-for-field to the Subscription shape in
// 06-API-CONTRACT.md so the IDE catches drift.
// ---------------------------------------------------------------------------

export const mockSubscriptions: Subscription[] = [
  // --- active, monthly, renewing today+3 (within 7-day window) ------------
  {
    id: "sub-netflix",
    user_id: "user-mock-1",
    category_id: "cat-streaming",
    name: "Netflix Premium",
    logo_url: "https://img.logo.dev/name/Netflix?token=pk_Tyc_cTBmTyepYzhnLPDjww&size=128&retina=true",
    price: 153000,
    currency: "IDR",
    billing_cycle: "monthly",
    custom_cycle_days: null,
    start_date: format(addDays(today, -90), "yyyy-MM-dd"),
    next_billing_date: format(addDays(today, 3), "yyyy-MM-dd"),
    status: "active",
    is_trial: false,
    trial_start_date: null,
    trial_end_date: null,
    trial_duration: null,
    trial_duration_unit: "days",
    payment_method: "GoPay",
    notes: null,
    created_at: iso(addDays(today, -90)),
    updated_at: iso(today),
    deleted_at: null,
  },

  // --- active, monthly, renewing today+20 (>7, ≤30 window) ---------------
  {
    id: "sub-spotify",
    user_id: "user-mock-1",
    category_id: "cat-music",
    name: "Spotify Premium",
    logo_url: "https://img.logo.dev/name/Spotify?token=pk_Tyc_cTBmTyepYzhnLPDjww&size=128&retina=true",
    price: 54990,
    currency: "IDR",
    billing_cycle: "monthly",
    custom_cycle_days: null,
    start_date: format(addDays(today, -120), "yyyy-MM-dd"),
    next_billing_date: format(addDays(today, 20), "yyyy-MM-dd"),
    status: "active",
    is_trial: false,
    trial_start_date: null,
    trial_end_date: null,
    trial_duration: null,
    trial_duration_unit: "days",
    payment_method: "DANA",
    notes: null,
    created_at: iso(addDays(today, -120)),
    updated_at: iso(today),
    deleted_at: null,
  },

  // --- active, monthly, renewing today+8 (>7, ≤30 window) -----------------
  {
    id: "sub-chatgpt",
    user_id: "user-mock-1",
    category_id: "cat-ai",
    name: "ChatGPT Go",
    logo_url: "https://img.logo.dev/name/ChatGPT?token=pk_Tyc_cTBmTyepYzhnLPDjww&size=128&retina=true",
    price: 69000,
    currency: "IDR",
    billing_cycle: "monthly",
    custom_cycle_days: null,
    start_date: format(addDays(today, -60), "yyyy-MM-dd"),
    next_billing_date: format(addDays(today, 8), "yyyy-MM-dd"),
    status: "active",
    is_trial: false,
    trial_start_date: null,
    trial_end_date: null,
    trial_duration: null,
    trial_duration_unit: "days",
    payment_method: "ShopeePay",
    notes: null,
    created_at: iso(addDays(today, -60)),
    updated_at: iso(today),
    deleted_at: null,
  },

  // --- trial, yearly, trial ends today+2 (≤3 danger bucket) ---------------
  {
    id: "sub-vidio",
    user_id: "user-mock-1",
    category_id: "cat-streaming",
    name: "Vidio",
    logo_url: "https://img.logo.dev/name/Vidio?token=pk_Tyc_cTBmTyepYzhnLPDjww&size=128&retina=true",
    price: 399000,
    currency: "IDR",
    billing_cycle: "yearly",
    custom_cycle_days: null,
    start_date: format(addDays(today, -28), "yyyy-MM-dd"),
    // If the trial converts, this becomes the first billing date.
    next_billing_date: format(addDays(today, 2), "yyyy-MM-dd"),
    status: "trial",
    is_trial: true,
    trial_start_date: format(addDays(today, -28), "yyyy-MM-dd"),
    trial_end_date: format(addDays(today, 2), "yyyy-MM-dd"),
    trial_duration: 30,
    trial_duration_unit: "days",
    payment_method: "OVO",
    notes: "Trial 30 hari — jangan lupa cancel kalo nggak dipake",
    created_at: iso(addDays(today, -30)),
    updated_at: iso(today),
    deleted_at: null,
  },

  // --- active, weekly, renewing today+5 (≤7 warning bucket) ---------------
  {
    id: "sub-canva",
    user_id: "user-mock-1",
    category_id: "cat-productivity",
    name: "Canva Pro",
    logo_url: "https://img.logo.dev/name/Canva?token=pk_Tyc_cTBmTyepYzhnLPDjww&size=128&retina=true",
    price: 89000,
    currency: "IDR",
    billing_cycle: "weekly",
    custom_cycle_days: null,
    start_date: format(addDays(today, -14), "yyyy-MM-dd"),
    next_billing_date: format(addDays(today, 5), "yyyy-MM-dd"),
    status: "active",
    is_trial: false,
    trial_start_date: null,
    trial_end_date: null,
    trial_duration: null,
    trial_duration_unit: "days",
    payment_method: "Kartu Kredit",
    notes: null,
    created_at: iso(addDays(today, -45)),
    updated_at: iso(today),
    deleted_at: null,
  },

  // --- paused, monthly — outside both windows (keep in list, but don't
  //     show in upcoming-renewals) ------------------------------------------
  {
    id: "sub-shopee",
    user_id: "user-mock-1",
    category_id: "cat-ecommerce",
    name: "Shopee VIP",
    logo_url: "https://img.logo.dev/name/Shopee?token=pk_Tyc_cTBmTyepYzhnLPDjww&size=128&retina=true",
    price: 49000,
    currency: "IDR",
    billing_cycle: "monthly",
    custom_cycle_days: null,
    start_date: format(addDays(today, -180), "yyyy-MM-dd"),
    next_billing_date: format(addDays(today, 45), "yyyy-MM-dd"),
    status: "paused",
    is_trial: false,
    trial_start_date: null,
    trial_end_date: null,
    trial_duration: null,
    trial_duration_unit: "days",
    payment_method: "ShopeePay",
    notes: "Lagi nggak dipake, di-pause dulu",
    created_at: iso(addDays(today, -190)),
    updated_at: iso(today),
    deleted_at: null,
  },

  // --- cancelled, monthly — outside both windows --------------------------
  {
    id: "sub-disney",
    user_id: "user-mock-1",
    category_id: "cat-streaming",
    name: "Disney+ Hotstar",
    logo_url: "https://img.logo.dev/name/Disney%2B%20Hotstar?token=pk_Tyc_cTBmTyepYzhnLPDjww&size=128&retina=true",
    price: 119000,
    currency: "IDR",
    billing_cycle: "monthly",
    custom_cycle_days: null,
    start_date: format(addDays(today, -300), "yyyy-MM-dd"),
    next_billing_date: format(addDays(today, 90), "yyyy-MM-dd"),
    status: "cancelled",
    is_trial: false,
    trial_start_date: null,
    trial_end_date: null,
    trial_duration: null,
    trial_duration_unit: "days",
    payment_method: "Transfer Bank",
    notes: "Cancel karena udah jarang nonton",
    created_at: iso(addDays(today, -310)),
    updated_at: iso(addDays(today, -2)),
    deleted_at: iso(addDays(today, -2)),
  },
];

// ---------------------------------------------------------------------------
// TODO(backend): replace with a real previous-month total once
// subscription_events exists (06-API-CONTRACT.md §6).  This standalone
// value is used by the hero delta badge on the Dashboard page.
//
// Current-month mock total ≈ Rp 696.000 → a 16 % increase from this
// baseline → delta badge coloured "warning" (spend went up).
// See 04-DESIGN-SYSTEM.md §2 for token mapping.
// ---------------------------------------------------------------------------
export const mockPreviousMonthTotal = 600000;
