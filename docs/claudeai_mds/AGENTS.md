# AGENTS.md — Master Context for the AI Coding Agent (opencode)

This file is the "brain" that the AI agent (Minimax M3 / DeepSeek v4 Pro & Lite / GLM 5.2 / Kimi Code 2.7) should read before starting work on the **Langganin** project. Place this file at the repo root. Also reference `01-PRD.md`, `02-TECH-STACK.md`, and `03-DATABASE-SCHEMA.md` in your initial prompt each session.

## 1. Project Summary (for the AI, one paragraph)
Langganin is a web app (Next.js App Router + TypeScript + Tailwind + Supabase + Drizzle) for tracking subscriptions and free trials, automatically calculating the next billing/trial date, and sending email reminders before auto-renewal/trial expiration, along with a spending dashboard.

## 2. Coding Rules (mandatory for the AI agent to follow)
- TypeScript **strict mode** — no `any` unless truly unavoidable (add a comment explaining why).
- All date manipulation MUST use `date-fns`; never manually compute `Date.now() + n*86400000`.
- Validate form & API input with `zod`; never trust raw client input.
- Use Server Actions for simple data mutations (create/update/delete subscription); use Route Handlers (`app/api/...`) for anything that needs to be called externally (cron, webhook).
- Every query against user-owned tables must filter by `user_id` (don't rely on RLS alone during local development).
- Use `shadcn/ui` components first before building custom components from scratch.
- Keep commits small & focused on one feature per commit/prompt — don't ask the AI to generate the entire app in one giant prompt.

### Naming & Structure
- Components: `PascalCase` (`SubscriptionCard.tsx`). Hooks: `camelCase` prefixed with `use` (`useSubscriptions.ts`). Folders/files that aren't components: `kebab-case` (`date-utils.ts`).
- Import order: React → Next.js → external packages → internal (`@/lib`, `@/components`) → relative imports → styles.
- Folder responsibility (so the AI agent doesn't guess where a file belongs):
  - `lib/db/` — Drizzle schema & DB client only.
  - `lib/services/` — business logic that touches the DB (e.g. `calculateNextBillingDate`, `createReminderRules`).
  - `lib/utils/` — pure helper functions with no DB/network access.
  - `types/` — shared TypeScript types/interfaces.
  - `components/ui/` — shadcn primitives only, never edited directly by hand (regenerate via CLI).
  - `components/` (root) — feature components composed from `ui/`.

### Always / Never (hard rules for the AI agent)
- **Never** create a single file over ~300 lines — split by responsibility instead.
- **Never** duplicate date/billing-cycle logic in more than one place — it lives in `lib/services/date-utils.ts` only.
- **Never** use inline styles — Tailwind classes only.
- **Always** design desktop-first (≥1280px canvas) for now — don't build mobile breakpoints yet; that's a separate later phase (see the checklist in §6).
- **Always** show a loading skeleton for async data, and handle the empty/error state explicitly — never leave a blank screen.
- **Prefer** composing small reusable components over one large page-specific component.

## 3. Build Order (Roadmap) — broken down into small prompts

### Phase 0 — Setup (do this manually or with a lightweight model)
1. Init Next.js + TypeScript + Tailwind + shadcn/ui.
2. Set up a Supabase project (Auth + Postgres), store `.env` (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Set up Drizzle + connect to Supabase Postgres.

### Phase 1 — MVP Core
1. Auth pages (login/register) using Supabase Auth.
2. Drizzle schema per `03-DATABASE-SCHEMA.md` + migration.
3. Subscription CRUD (add/edit form, list, delete) + logic to auto-calculate `next_billing_date` & `trial_end_date`.
4. Dashboard: total monthly spend, upcoming renewals for 7/30 days.
5. Simple calendar view.

### Phase 2 — Notifications
1. Set up Resend + email reminder template.
2. Route Handler `/api/cron/check-renewals` triggered daily by Vercel Cron → check the `reminders` table → send email → update `sent_at`.
3. (Optional) Web push notification.

### Phase 3 — Polish & Nice-to-have
1. Export CSV/PDF report.
2. Budget cap alert.
3. Dark mode + PWA.
4. Custom categories & tags.

### Phase 4 — AI Features (showcase your AI engineering skills)
1. Simple insights (rule-based first, e.g. "this subscription hasn't been marked as 'used' in the last 30 days").
2. Natural-language chatbot query over user data using a small LLM.

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
- [ ] Works cleanly on the target desktop viewport (1440px, minimum 1280px). Mobile is not required yet — see the build checklist below for when that phase starts.

## 6. Build Progress Checklist
Track progress here as phases complete (check off in this file as you go):
- [ ] Phase 0 — Setup (Next.js, Supabase, Drizzle)
- [ ] Phase 1 — Auth
- [ ] Phase 1 — Subscription CRUD
- [ ] Phase 1 — Dashboard
- [ ] Phase 1 — Calendar view
- [ ] Phase 2 — Email reminders + cron
- [ ] Phase 2 — Web push (optional)
- [ ] Phase 2 — WhatsApp reminders (optional, differentiator)
- [ ] Phase 3 — Export CSV/PDF
- [ ] Phase 3 — Budget cap alert
- [ ] Phase 3 — Dark mode + PWA
- [ ] Phase 3.5 — Responsive/mobile adaptation of existing desktop screens (deliberately deferred — see `01-PRD.md` §9)
- [ ] Phase 4 — AI insights / chatbot
