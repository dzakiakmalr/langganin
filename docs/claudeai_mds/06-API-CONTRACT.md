# API Contract — Langganin

All endpoints are under `/api/`, require an authenticated session (Supabase Auth), and always scope queries to the current `user_id`. Prefer Server Actions for simple mutations from within the app itself; this contract matters most for the Route Handlers used by the cron job and any future external/mobile client.

## Conventions
- Request/response bodies: JSON.
- Dates: ISO 8601 strings (`YYYY-MM-DD` for date-only fields like `start_date`).
- Errors: `{ "error": { "code": string, "message": string } }` with an appropriate HTTP status — never throw a raw unhandled error.
- Success responses for single resources: the resource object directly. For lists: `{ "data": [...] }`.

## Subscriptions

### `GET /api/subscriptions`
Query params: `status` (optional filter), `category_id` (optional filter), `search` (optional name search).
- 200: `{ "data": Subscription[] }`

### `POST /api/subscriptions`
Body: `{ name, category_id?, price, currency, billing_cycle, custom_cycle_days?, start_date, is_trial?, trial_duration_days?, payment_method, notes? }`
- 201: created `Subscription` object (with `next_billing_date`/`trial_end_date` computed server-side).
- 400: validation error (`VALIDATION_ERROR`) if zod parsing fails.

### `GET /api/subscriptions/:id`
- 200: `Subscription` object.
- 404: `NOT_FOUND` if it doesn't exist or doesn't belong to the current user.

### `PATCH /api/subscriptions/:id`
Body: any subset of the fields from `POST`. If `start_date` or `billing_cycle` changes, `next_billing_date` is recalculated server-side.
- 200: updated `Subscription` object.
- 400 / 404 as above.

### `DELETE /api/subscriptions/:id`
- 204: no content.
- 404 as above.

## Categories

### `GET /api/categories`
- 200: `{ "data": Category[] }` (global defaults + this user's custom ones).

### `POST /api/categories`
Body: `{ name, icon?, color? }`
- 201: created `Category`.

## Reminders (mostly internal — used by the cron job)

### `GET /api/cron/check-renewals`
Triggered by Vercel Cron (protected by a secret header, e.g. `Authorization: Bearer <CRON_SECRET>` — reject with 401 if missing/invalid).
- Finds due reminders (per `03-DATABASE-SCHEMA.md` §5), sends emails via Resend, marks `sent_at`.
- 200: `{ "sent": number }`
- Never expose this route to the client UI.

## Shape reference

```ts
type Subscription = {
  id: string;
  name: string;
  category_id: string | null;
  price: number;
  currency: string;
  billing_cycle: "weekly" | "monthly" | "yearly" | "custom_days";
  custom_cycle_days: number | null;
  start_date: string;       // YYYY-MM-DD
  next_billing_date: string;
  status: "active" | "trial" | "paused" | "cancelled";
  is_trial: boolean;
  trial_start_date: string | null;
  trial_end_date: string | null;
  trial_duration_days: number | null;
  payment_method: "credit_card" | "debit_card" | "gopay" | "ovo" | "dana" | "shopeepay" | "qris" | "bank_transfer" | "other";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type Category = {
  id: string;
  user_id: string | null;   // null = global default
  name: string;
  icon: string | null;
  color: string | null;
};
```
