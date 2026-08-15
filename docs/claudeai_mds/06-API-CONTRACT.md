# API Contract — Langganin

> This contract reflects the **frontend that is already implemented** (in-memory `SubscriptionsProvider` + localStorage). The backend must mirror these shapes and behaviors so the client code stays unchanged when it switches from mock data to real queries. See `types/subscription.ts`, `types/notifications.ts`, and `lib/services/billing-dates.ts` for the exact client-side types.

All endpoints live under `/api/`, require an authenticated session (Supabase Auth), and always scope queries to the current `user_id`. Prefer Server Actions for mutations initiated from within the app; Route Handlers are for external callers (cron, webhook) and the AI chat stream.

## Conventions
- Request/response bodies: JSON (except `/api/chat`, which is a UI message stream).
- Dates: ISO 8601 strings — `YYYY-MM-DD` for date-only fields (`start_date`, `next_billing_date`, `trial_end_date`); `timestamptz` for `created_at`/`updated_at`/`deleted_at`.
- Errors: `{ "error": { "code": string, "message": string } }` with an appropriate HTTP status — never throw a raw unhandled error.
- Success for single resources: the resource object directly. For lists: `{ "data": [...] }`.

---

## Subscriptions

> `status` semantics (matches the frontend):
> - `active` / `trial` — live subscriptions (shown in renewals, calendar, notifications).
> - `paused` — temporarily on hold, excluded from reminders.
> - `cancelled` — **soft-deleted** ("Baru dihapus"). Kept for a 14-day retention window (`DELETED_RETENTION_DAYS`), restorable, then auto-purged. `deleted_at` is set when entering this state.

### `GET /api/subscriptions`
Query params: `status` (optional), `category_id` (optional), `search` (optional name search).
- 200: `{ "data": Subscription[] }`
- By default excludes subscriptions whose `deleted_at` is older than the retention window.

### `POST /api/subscriptions`
Body: `{ name, category_id?, price, currency, billing_cycle, custom_cycle_days?, start_date, is_trial?, trial_duration?, trial_duration_unit?, payment_method?, notes? }`
- `next_billing_date` and `trial_end_date` are computed **server-side** (`lib/services/billing-dates.ts`) — never trusted from the client.
- 201: created `Subscription`.
- 400: `VALIDATION_ERROR` if zod parsing fails.

### `GET /api/subscriptions/:id`
- 200: `Subscription` object (excluding `deleted_at` — see below).
- 404: `NOT_FOUND` if it doesn't exist, doesn't belong to the user, or is past the retention window.

### `PATCH /api/subscriptions/:id`
Body: any subset of the writable fields. If `start_date`, `billing_cycle`, `is_trial`, or `trial_duration*` changes, `next_billing_date`/`trial_end_date` are recalculated server-side.
- 200: updated `Subscription`.
- 400 / 404 as above.

### `DELETE /api/subscriptions/:id`  →  **soft delete**
Sets `status = "cancelled"` + `deleted_at = now`. Does NOT hard-delete.
- 204: no content.
- 404 as above.

### `POST /api/subscriptions/:id/restore`
Undoes a soft delete: clears `deleted_at`, sets `status` back to `trial` (if `is_trial`) or `active`.
- 200: restored `Subscription`.
- 404 as above.

---

## Categories

User-owned categories are full CRUD (default categories have `user_id = null` and are read-only).

### `GET /api/categories`
- 200: `{ "data": Category[] }` (global defaults + this user's custom ones).

### `POST /api/categories`
Body: `{ name, color?, icon? }`
- 201: created `Category` (with `user_id` = current user).

### `PATCH /api/categories/:id`
Body: `{ name?, color?, icon? }`
- 200: updated `Category`.
- 404 / 400 if it's a global default (`user_id = null`) — defaults are immutable.

### `DELETE /api/categories/:id`
Deletes the category and **moves all its subscriptions to "uncategorized"** (`category_id = null`), preserving the subscriptions.
- 204: no content.
- 404 / 400 if global default.

---

## Notification Preferences

The frontend models **preferences** (not per-cycle reminder rows). The bell is populated by *re-scanning* subscriptions against these preferences. Backend should persist preferences and use them in the cron job.

```ts
type SubscriptionOverride = {
  daysBefore: number[];          // H- days before a renewal (active subs)
  trialDaysBefore: number[];     // H- days before a trial ends
  channels: NotificationChannel[]; // "whatsapp" | "email" | "google_calendar"
};

type ReminderPreferences = {
  global: SubscriptionOverride;
  perSubscription: Record<string, SubscriptionOverride | null>; // null = use global
};
```

### `GET /api/notification-preferences`
- 200: `ReminderPreferences`.

### `PUT /api/notification-preferences/global`
Body: `SubscriptionOverride`
- 200: updated preferences.

### `PUT /api/notification-preferences/subscriptions/:id`
Body: `SubscriptionOverride | null`
- 200: updated preferences. `null` clears the override.

### `POST /api/notifications/:id/read`
Marks a computed notification as read (client currently tracks read-state locally — backend may store a `read_at`/set of read ids per user).
- 204: no content.

---

## Data Backup (manual export/import)

The frontend supports JSON backup/restore while there is no backend. If a server-side equivalent is added, keep this exact payload so existing backups import cleanly:

```json
{
  "app": "langganin",
  "version": 1,
  "exportedAt": "ISO-8601",
  "profileName": "...",
  "currencyFormat": "id" | "en",
  "defaultCurrency": "IDR",
  "paymentMethods": ["GoPay", "OVO"],
  "subscriptions": [],
  "categories": [],
  "preferences": { "global": {}, "perSubscription": {} }
}
```

(Optional) `POST /api/backup/import` / `GET /api/backup/export` — not required for MVP.

---

## AI Chat (streaming)

### `POST /api/chat`
Streaming UI-message stream (Vercel AI SDK). Node.js runtime.

Body:
```json
{
  "messages": [{ "id": "...", "role": "user|assistant|system", "parts": [] }],
  "locale": "id" | "en",
  "context": { "subscriptions": [], "categories": [] }
}
```

- **Today:** the client ships a snapshot of the user's subscriptions/categories as `context`; the route builds a system prompt from it (no DB access).
- **When the backend lands:** replace the client-shipped `context` with a server-side query scoped by `user_id` (keep `context` optional/ignored). Cap it (~500 subs, ~32 KB prompt) to prevent prompt abuse.
- 503 `NO_API_KEY` if `OPENROUTER_API_KEY` is unset; 400 `VALIDATION_ERROR`; 413 `CONTEXT_TOO_LARGE`; 502 `UPSTREAM_UNREACHABLE`.

---

## Cron (external trigger)

### `GET /api/cron/check-renewals`
Triggered daily (Vercel Cron), protected by `Authorization: Bearer <CRON_SECRET>` (401 if missing/invalid).
- Scans subscriptions (excluding `paused`/`cancelled`), matches each active sub's `next_billing_date` and trial sub's `trial_end_date` against `preferences.daysBefore` / `trialDaysBefore`.
- Sends reminders on the enabled channels, records sent events (so it doesn't re-send), marks `sent_at`.
- 200: `{ "sent": number }`.
- Never expose this route to the client UI.

---

## Shape reference (authoritative — mirror of `types/subscription.ts`)

```ts
type BillingCycle = "weekly" | "monthly" | "yearly" | "custom_days";
type SubscriptionStatus = "active" | "trial" | "paused" | "cancelled";
type TrialDurationUnit = "days" | "months" | "years";

type Subscription = {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  logo_url: string | null;        // Logo.dev URL (auto-resolved from name)
  price: number;
  currency: string;                // default "IDR"
  billing_cycle: BillingCycle;
  custom_cycle_days: number | null;
  start_date: string;              // YYYY-MM-DD
  next_billing_date: string;       // YYYY-MM-DD, computed server-side
  status: SubscriptionStatus;
  is_trial: boolean;
  trial_start_date: string | null;
  trial_end_date: string | null;   // computed server-side
  trial_duration: number | null;
  trial_duration_unit: TrialDurationUnit; // "days" | "months" | "years"
  payment_method: string;          // free-form text (GoPay, "Kartu Kredit BCA", …)
  notes: string | null;
  created_at: string;              // ISO 8601
  updated_at: string;              // ISO 8601
  deleted_at: string | null;       // set on soft-delete
};

type Category = {
  id: string;
  user_id: string | null;          // null = global default
  name: string;
  icon: string | null;             // lucide-react icon name
  color: string | null;            // hex color (charts + badges)
};
```
