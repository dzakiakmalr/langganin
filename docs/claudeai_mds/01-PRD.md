# PRD — Langganin (Subscription & Trial Reminder App)

> "Langganin" is just a placeholder name — change it as you like (other ideas: Subly, TrackSub.id, SubKeeper, Boncos.id 😅).

## Implementation status (keeps the backend aligned with the frontend)

The **frontend is fully implemented** with mock data + localStorage (no real DB/auth yet). Everything below the "backend" TODO markers in code must map 1:1 to the real data layer. Summary of what already works on the client:

- **Auth** — login/register pages exist as placeholders (Supabase Auth not wired yet).
- **Subscription CRUD** — add/edit/delete, auto-calculated `next_billing_date` + `trial_end_date`, trial duration in **days/months/years** (`trial_duration` + `trial_duration_unit`), **free-form** `payment_method`, **soft delete** with 14-day retention + restore.
- **Categories** — full CRUD (default + user-owned); deleting a category reassigns its subs to "uncategorized".
- **Dashboard** — summary cards (monthly/yearly/active count), mini calendar, upcoming renewals (7/30 days, clickable → detail modal), spending-by-category chart.
- **Notifications** — in-app bell + dropdown, per-channel preferences (WhatsApp / Email / Google Calendar), global + per-subscription H- overrides. Delivery is not yet wired (preferences are saved only).
- **Calendar** — month/week views, colored markers, date popover, export `.ics` / `.csv`.
- **Analytics** — monthly trend, subscription ranking, category/payment breakdown, insight cards. (Originally "Phase 3" — now implemented.)
- **AI chat** — streaming assistant (`/api/chat`, OpenRouter) that answers questions over the user's subscription data. (Originally "Phase 3" — now implemented.)
- **Export** — CSV, Excel (`.xls`), and JSON backup/restore in Settings.
- **i18n** — full Indonesian (default) + English.
- **Responsive** — the app is now fully responsive (mobile drawer nav, responsive cards/list). The old "desktop-first, mobile later" note no longer applies.

## 1. Problem Statement
Many Indonesians subscribe to multiple digital services (Shopee VIP, Spotify Premium, Netflix, ChatGPT Go, Claude Pro, etc.) or try free trials (7/14/30 days). Because start dates and end dates aren't tracked properly, people forget to cancel before auto-renewal, resulting in unexpected charges ("silent bleeding of money"). There's no single centralized place to see all active subscriptions, total monthly spend, and when each one will renew or expire.

## 2. Target Users
- Indonesian students & young professionals with many digital subscriptions.
- People who often try free trials but forget to cancel.
- Freelancers/remote workers using many paid tools (Notion, ChatGPT, Claude, GitHub Copilot, etc.).

## 3. Goals & Success Metrics
| Goal | Metric |
|---|---|
| Prevent unexpected charges | Number of reminders sent before renewal/trial ends |
| Spending visibility | User can see total monthly/yearly spend in under 5 seconds of opening the app |
| Retention | User returns to the app at least once a week to check the dashboard |
| Adoption | Number of subscriptions successfully tracked per user |

## 4. Core Features — MVP (Phase 1)
1. **Auth** — sign up/login (email+password, optional Google OAuth).
2. **Subscription CRUD**
   - Service name, category (streaming, productivity, AI tools, e-commerce membership, gaming, etc.), logo (auto-resolved from name).
   - Price & currency (default IDR).
   - Billing cycle: weekly / monthly / yearly / custom (e.g. every 3 months).
   - Subscription start date.
   - Next billing date (**auto-calculated** from start date + cycle, so the user doesn't have to compute it manually).
   - Status: `active`, `trial`, `paused`, `cancelled` — where `cancelled` is a **soft delete** (14-day retention, restorable).
   - Payment method is a **free-form string** (GoPay/OVO/DANA/ShopeePay/QRIS/card/bank are quick-pick suggestions, not an enum).
3. **Trial Tracking**
   - Dedicated fields: trial start date + trial duration (7/14/30/custom, in days/months/years) → auto-calculates trial end date.
   - More aggressive reminders for trials (e.g. D-2 and D-1) since the risk of auto-charge is higher.
4. **Dashboard**
   - Total monthly & yearly spend (projected).
   - "Upcoming renewals" list for the next 7 and 30 days.
   - Spending breakdown by category (pie/bar chart).
5. **Reminders/Notifications**
   - Per-subscription + global reminder preferences: H- days (default 7/3/1/0, custom 0–60) and channels (Email / WhatsApp / Google Calendar).
   - In-app notification bell with unread count and mark-as-read.
   - Actual delivery (email via Resend, WhatsApp via Fonnte/Twilio) is the remaining backend work.
6. **Calendar View**
   - Month + week views showing renewal/trial-end dates; export to `.ics` or `.csv`.

## 5. Phase 2 (Nice-to-have after MVP is running)
- ~~Export report to PDF/CSV~~ — CSV + Excel (`.xls`) export already implemented client-side.
- Budget cap / alert if total subscriptions this month exceed a user-defined budget.
- Quick action: direct link to each service's cancel/manage page (a manually curated list of common links).
- Family/shared subscriptions — split cost with family/friends.
- Dark mode + installable PWA (to feel like a native app on mobile).
- Custom tags/labels per subscription (e.g. "work", "personal").

## 6. Phase 3 (Advanced / AI-powered — good for showcasing your AI engineering skills)
- ~~AI chatbot~~ — **implemented**: streaming `/api/chat` assistant that answers "what's my total spend this month?" over the user's subscription snapshot.
- ~~Analytics~~ — **implemented**: monthly spend trend, subscription ranking, category/payment breakdown, insight cards.
- AI usage insight: "You haven't opened Spotify in 3 weeks, want to pause it?" (requires usage tracking, or a weekly manual check-in).
- AI churn/renewal prediction: highlight subscriptions with a pattern of being frequently skipped/missed.
- Email parsing (optional & complex): read-only Gmail connection to auto-detect new subscription/trial confirmation emails.

## 7. User Stories (examples, for breaking tasks down for the AI coding agent)
- As a user, I want to add a new subscription with name, price, cycle, and start date, so the system automatically calculates the next billing date.
- As a user, I want to see all subscriptions renewing in the next 7 days, so I can decide to cancel or continue.
- As a user, I want to receive an email 1 day before my trial ends, so I don't get charged automatically.
- As a user, I want to see total monthly spend in a single dashboard, so I can manage my budget.

## 8. Competitive Landscape & Differentiation
Similar tools already exist as open source, so the raw idea ("track my subscriptions") is not novel by itself. Known examples: Wallos (self-hosted, multi-currency, Email/Telegram/Discord reminders), Subs (simple, no third-party data), Wapy.dev (Next.js/Prisma SaaS + self-host, push notifications), and Zublo (React/PocketBase, has a built-in AI layer for spend analysis). None of them are built around the Indonesian market specifically — they're all Western/generic-currency first. That gap is where Langganin's differentiation should come from:

1. **Indonesian payment rails as first-class values**, not a generic "e-wallet" label — GoPay, OVO, DANA, ShopeePay, QRIS are explicit options (see `03-DATABASE-SCHEMA.md`).
2. **WhatsApp reminders** instead of only Email/Telegram/Discord — WhatsApp is the channel Indonesian users actually check.
3. **Curated cancellation guide** for common Indonesian services (Shopee VIP, Vidio, IndiHome, etc.) — a small, manually maintained reference of "how to actually cancel this", which none of the existing global trackers bother to localize.
4. **Shared-subscription split calculator** — splitting Netflix/Spotify Family among friends/family via a group chat is common practice in Indonesia; track who owes what and remind them.
5. **Rupiah/Bahasa Indonesia as the default experience**, not an added locale — copy, number formatting, and date formatting are Indonesian by default.

These are the features worth highlighting in a portfolio narrative ("built for a market global subscription trackers ignore"), not just "yet another subscription tracker."

## 9. Non-Functional Requirements
- **Responsive** (updated): the app is now built mobile-first-capable — the sidebar collapses to a drawer on small screens, and cards/list layouts have explicit mobile breakpoints. Target ≥360px phones through desktop.
- Lightweight & fast (many Indonesian users have limited connectivity) → prioritize SSR/edge rendering, avoid heavy bundles.
- Sensitive data (prices, dates) accessible only to the owning user (row-level security).
- Timezone-aware (default Asia/Jakarta, but fields must be timezone-safe to avoid off-by-one-day bugs on renewal dates).
- i18n: Indonesian (default, prefix-free) + English (`/en`).
