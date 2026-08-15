# AGENTS.md — Master Context for the AI Coding Agent (opencode)

This file is the "brain" that the AI agent (Minimax M3 / DeepSeek v4 Pro & Lite / GLM 5.2 / Kimi Code 2.7) should read before starting work on the **Langganin** project. Place this file at the repo root. Also reference `01-PRD.md`, `02-TECH-STACK.md`, and `03-DATABASE-SCHEMA.md` in your initial prompt each session.

## 1. Project Summary (for the AI, one paragraph)
Langganin is a web app (Next.js 16 App Router + TypeScript + Tailwind v4 + a custom claymorphism/glassmorphism design system) for tracking subscriptions and free trials, auto-calculating the next billing/trial date, showing a spending dashboard + calendar + analytics, and answering questions over the data via a streaming AI chat. The **frontend is complete** and runs on in-memory mock data + localStorage (`SubscriptionsProvider`). The remaining work is the **backend**: Supabase Auth + Postgres (Drizzle), persisting subscriptions/categories/notification preferences via Server Actions, and delivering reminders (email/WhatsApp) via a daily cron.

## 2. Coding Rules (mandatory for the AI agent to follow)
- TypeScript **strict mode** — no `any` unless truly unavoidable (add a comment explaining why).
- All date manipulation MUST use `date-fns`; never manually compute `Date.now() + n*86400000`.
- Validate form & API input with `zod`; never trust raw client input.
- Use Server Actions for simple data mutations (create/update/delete subscription); use Route Handlers (`app/api/...`) for anything that needs to be called externally (cron, webhook, chat stream).
- Every query against user-owned tables must filter by `user_id` (don't rely on RLS alone during local development).
- **Do NOT add shadcn/ui** — the app has its own claymorphism/glassmorphism design system (`app/globals.css` `@theme`/`@utility` tokens). Build custom components on top of `components/ui/*` primitives instead.
- Keep commits small & focused on one feature per commit/prompt — don't ask the AI to generate the entire app in one giant prompt.

### Naming & Structure (matches the implemented frontend)
- Components: `PascalCase` (`SubscriptionCard.tsx`). Hooks: `camelCase` prefixed with `use` (`useSubscriptions`). Folders/files that aren't components: `kebab-case` (`date-utils.ts`).
- Import order: React → Next.js → external packages → internal (`@/lib`, `@/components`) → relative imports → styles.
- Folder responsibility:
  - `lib/db/` — Drizzle schema & DB client only (currently empty; backend lands here).
  - `lib/services/` — business logic (e.g. `calculateNextBillingDate`, `data-management`) — move server-side later.
  - `lib/utils/` — pure helpers with no DB/network access (analytics, export-*, format-currency, notifications, subscription-math/dates).
  - `types/` — shared TypeScript types (`subscription.ts`, `notifications.ts` — these are authoritative).
  - `components/ui/` — shared primitives (BrandLogo, CategoryBadge, ConfirmDialog, ChartCard, etc.).
  - `components/{layout,dashboard,subscriptions,calendar,analytics,notifications,settings,chat,landing}/` — feature components.
  - `lib/messages/{id,en}.json` — i18n strings (next-intl).
  - `lib/mock/` — mock seed data (removed when the backend lands).
  - `lib/ai/`, `lib/brands/` — AI chat config + brand/logo registry.

### Always / Never (hard rules for the AI agent)
- **Never** create a single file over ~300 lines — split by responsibility instead.
- **Never** duplicate date/billing-cycle logic in more than one place — it lives in `lib/services/billing-dates.ts` only.
- **Never** use inline styles — Tailwind classes only (the one deliberate exception: dynamic brand/category colors via `style={{ color }}`).
- **Always** build mobile-first/responsive (the app targets ≥360px phones through desktop — mobile is already implemented; don't regress it).
- **Always** show a loading skeleton for async data, and handle the empty/error state explicitly — never leave a blank screen.
- **Prefer** composing small reusable components over one large page-specific component.
- **Keep the `SubscriptionsProvider` public API stable** — it is the single seam where in-memory state will be swapped for real backend calls (see `05-SITEMAP-AND-FLOWS.md` §5).

## 3. Build Order (Roadmap) — broken down into small prompts

> **Current state:** all of Phase 1–4 *frontend* is already built (mock/localStorage). The roadmap below is what's left: wire the backend and turn preferences into actual delivery.

### Phase 0 — Backend setup
1. Init Supabase (Auth + Postgres), store `.env` (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
2. Add Drizzle + connect to Supabase Postgres; write `lib/db/schema.ts` per `03-DATABASE-SCHEMA.md` + migration.

### Phase 1 — Persist core
1. Auth pages using Supabase Auth (replace placeholders).
2. Replace `SubscriptionsProvider` internals with Server Actions / Route Handlers (keep its public API stable — see `06-API-CONTRACT.md`).
3. Move `next_billing_date` / `trial_end_date` computation server-side (`lib/services/billing-dates.ts` already has the pure functions).
4. Categories + settings persistence (profile, currency, payment methods).

### Phase 2 — Reminders delivery
1. Set up Resend + email reminder template.
2. Route Handler `/api/cron/check-renewals` (Vercel Cron) → read `notification_preferences` + `subscription_overrides` → send → log to `reminder_sends`.
3. (Optional) WhatsApp reminders via Fonnte/Twilio.

### Phase 3 — Polish (optional)
1. Budget cap alert.
2. Dark mode + PWA.

### Phase 4 — AI hardening
1. `/api/chat`: replace the client-shipped `context` with a server-side `user_id`-scoped query.
2. Optional agentic/tool-calling loops over user data.

## 4. Suggested Model Assignment (opencode)
Since you have several models with different strengths & costs, here's a rough split of tasks (adjust based on your own experience — each model has a different character):

| Task Type | Characteristics | Suggested Model |
|---|---|---|
| Boilerplate setup, UI styling (Tailwind/shadcn), simple CRUD forms | Repetitive, clear patterns | **Lightweight/lite model** (e.g. DeepSeek Lite) — cost-efficient and sufficient for common patterns |
| Date logic (billing cycle, trial calculation), DB schema, RLS policy | Needs precision & careful reasoning, easy to get off-by-one errors | **Your strongest model** (e.g. DeepSeek Pro / GLM 5.2 / Minimax M3) |
| Cron job + email integration (Resend), debugging complex errors | Needs multi-step reasoning, often requires trial-and-error | A strong model, or Kimi Code for long tasks that need large context |
| Small refactors, renames, fixing lint/type errors | Simple tasks | Lightweight model |
| AI features (Phase 4) — prompt design, small RAG/agent architecture | This is actually a chance to practice the AI engineering skills from your internship | Design it yourself first as practice, then ask the AI to help implement |

> Tip: start each new session by pasting the contents of `AGENTS.md` + `03-DATABASE-SCHEMA.md` into the context, so whichever model you use stays consistent with the architectural decisions already made, instead of reinventing the structure from scratch every time you switch models.

## 5. Definition of Done per Feature
A feature is considered done when:
- [ ] Type-safe (no TS errors).
- [ ] Input validation (zod) exists on both the form & the API.
- [ ] Manually tested in the browser (happy path + at least 1 edge case, e.g. end-of-month date).
- [ ] DB queries are filtered by `user_id`.
- [ ] No leftover `console.log` debugging statements.

### Example acceptance criteria — Subscription CRUD
Don't accept "CRUD is done" as a status — check it against concrete criteria instead:
- [ ] User can create a subscription and `next_billing_date` is calculated correctly for all billing cycles (weekly/monthly/yearly/custom).
- [ ] User can edit a subscription and `next_billing_date` recalculates if `start_date` or `billing_cycle` changes.
- [ ] User can delete a subscription (with a confirm dialog).
- [ ] Validation errors show inline on the form, not just a toast.
- [ ] No TS or lint errors.
- [ ] Works cleanly on both mobile (≥360px) and desktop (≥1280px) — the app is responsive; don't regress it.

## 6. Build Progress Checklist
> Frontend is **fully implemented** with mock data + localStorage. Remaining work is the backend swap (Supabase + Drizzle + Server Actions) and reminder delivery.

### Frontend (done — mock/localStorage)
- [x] Landing page (public, i18n)
- [x] Auth placeholders (login/register)
- [x] Subscription CRUD UI (add/edit/soft-delete/restore, auto date calc)
- [x] Categories CRUD (default + user-owned)
- [x] Dashboard (summary, mini calendar, renewals, chart, AI chat)
- [x] Calendar (month/week, popover, export .ics/.csv)
- [x] Notifications (bell, dropdown, preferences)
- [x] Analytics (trends, ranking, breakdown, insights)
- [x] AI chat (streaming /api/chat)
- [x] Export CSV + Excel; JSON backup/restore
- [x] Settings (profile, currency, payment methods, data management)
- [x] Responsive (mobile drawer nav + breakpoints)

### Backend (pending — the next phase)
- [ ] Phase 0 — Supabase + Drizzle setup (env, `lib/db/` schema)
- [ ] Phase 1 — Auth (wire Supabase Auth)
- [ ] Phase 1 — Persist subscriptions/categories via Server Actions/Route Handlers (per `06-API-CONTRACT.md`)
- [ ] Phase 1 — Move `lib/services/billing-dates.ts` server-side for `next_billing_date`/`trial_end_date`
- [ ] Phase 2 — Reminder delivery (email via Resend; cron `/api/cron/check-renewals` + `reminder_sends` log)
- [ ] Phase 2 — WhatsApp reminders (optional, differentiator)
- [ ] Phase 3 — Budget cap alert (optional)
- [ ] Phase 3 — Dark mode + PWA (optional)
- [ ] Phase 4 — AI chat: replace client-shipped `context` with a `user_id`-scoped server query
