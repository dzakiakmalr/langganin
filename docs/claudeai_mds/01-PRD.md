# PRD — Langganin (Subscription & Trial Reminder App)

> "Langganin" is just a placeholder name — change it as you like (other ideas: Subly, TrackSub.id, SubKeeper, Boncos.id 😅).

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
   - Service name, category (streaming, productivity, AI tools, e-commerce membership, gaming, etc.), logo/icon.
   - Price & currency (default IDR).
   - Billing cycle: weekly / monthly / yearly / custom (e.g. every 3 months).
   - Subscription start date.
   - Next billing date (**auto-calculated** from start date + cycle, so the user doesn't have to compute it manually).
   - Status: `active`, `trial`, `paused`, `cancelled`.
   - Payment method (e-wallet: GoPay/OVO/Dana, credit/debit card, bank transfer) — just a label, not a direct integration.
3. **Trial Tracking**
   - Dedicated fields: trial start date + trial duration (7/14/30/custom days) → auto-calculates trial end date.
   - More aggressive reminders for trials (e.g. D-2 and D-1) since the risk of auto-charge is higher.
4. **Dashboard**
   - Total monthly & yearly spend (projected).
   - "Upcoming renewals" list for the next 7 and 30 days.
   - Spending breakdown by category (pie/bar chart).
5. **Reminders/Notifications**
   - Email reminders D-3, D-1 before billing/trial ends (configurable per subscription).
   - (Optional MVP+) Web push notification if used as a PWA.
6. **Calendar View**
   - Monthly calendar showing renewal/trial-end dates.

## 5. Phase 2 (Nice-to-have after MVP is running)
- Export report to PDF/CSV (for monthly/yearly review).
- Budget cap / alert if total subscriptions this month exceed a user-defined budget.
- Quick action: direct link to each service's cancel/manage page (a manually curated list of common links).
- Family/shared subscriptions — split cost with family/friends.
- Dark mode + installable PWA (to feel like a native app on mobile).
- Custom tags/labels per subscription (e.g. "work", "personal").

## 6. Phase 3 (Advanced / AI-powered — good for showcasing your AI engineering skills)
- **AI usage insight**: "You haven't opened Spotify in 3 weeks, want to pause it?" (requires usage tracking, or at minimum a weekly manual check-in from the user).
- **Simple AI churn/renewal prediction**: highlight subscriptions with a pattern of frequently being skipped/missed.
- **Email parsing (optional & complex)**: read-only Gmail connection to auto-detect new subscription/trial confirmation emails — this is a heavy feature, save it for last if there's time/a follow-up project.
- **Chatbot assistant** ("what's my total subscription spend this month?") using a small LLM as a natural-language layer on top of user data.

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
- **Desktop-first** (per current direction): design and build for a ≥1280px desktop canvas first; a responsive/mobile-optimized layout is a deliberate later phase, not built in parallel — see `AGENTS.md` build checklist and `04-DESIGN-SYSTEM.md` §7.
- Lightweight & fast (many Indonesian users have limited connectivity) → prioritize SSR/edge rendering, avoid heavy bundles.
- Sensitive data (prices, dates) accessible only to the owning user (row-level security).
- Timezone-aware (default Asia/Jakarta, but fields must be timezone-safe to avoid off-by-one-day bugs on renewal dates).
