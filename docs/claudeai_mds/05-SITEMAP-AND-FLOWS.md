# Sitemap, Components & UX Flows — Langganin

> Updated to match the implemented frontend (routes under `app/[locale]/(dashboard)/dashboard/...`, components under `components/{dashboard,subscriptions,calendar,analytics,notifications,settings,chat,layout,ui,landing}/`).

## 1. Sitemap

```
Landing (public) — / and /en
  └─ Login (/login)          — placeholder (Supabase Auth not wired)
  └─ Register (/register)    — placeholder
Dashboard (auth required) — /dashboard (and /en/dashboard)
  ├─ Dashboard              — summary cards, mini calendar, upcoming renewals, category chart, AI chat panel
  ├─ Subscriptions          — card/list view, search, filters, group-by, bulk select/delete, export
  │    └─ Subscription Detail/Edit  (/dashboard/subscriptions/[id])
  ├─ Notifications          — in-app notification list + reminder preferences
  ├─ Calendar               — month/week view, date popover, export .ics/.csv
  ├─ Analytics              — monthly trend, ranking, category/payment breakdown, insights
  └─ Settings               — profile, currency, payment methods, notification defaults, data backup
```

## 2. Page Contents (so the AI agent doesn't invent layout on its own)

### Dashboard
- Summary cards: total monthly spend, projected yearly spend, active subscriptions count (with logo stack).
- Mini calendar sidebar (clickable dates).
- "Upcoming renewals" list — 7 days then 30 days. Each row is **clickable → opens the detail modal**.
- Spending-by-category chart (pie).
- AI chat panel (streaming assistant).
- Empty state: friendly message + "Add your first subscription" button.

### Subscriptions (list)
- **Card grid** and **list** views (toggle persisted to localStorage).
- Search (also wired to topbar search via `?q=`), filter by category & status, group-by (none/date/category/status).
- **Bulk select**: a "Pilih banyak" toggle reveals checkboxes; a bottom action bar offers select-all / delete-selected (soft delete) with confirm.
- Per-item actions: **view detail** (eye → modal), edit, pause/resume, delete (soft), restore (for deleted).
- **Export** button → CSV (`.csv`) or Excel (`.xls`).
- "Add Subscription" button (modal form) + "Kelola kategori" (category manager modal).

### Subscription Detail / Edit (`/dashboard/subscriptions/[id]`)
- Full form: name (with live brand/logo detection), category, price, currency, billing cycle, start date, trial toggle + duration (days/months/years), payment method (free-form + quick-picks), notes.
- Delete (soft) is an icon button next to Batal/Simpan.
- `ConfirmDialog` for delete.
- Not-found state with "back to list".

### Notifications
- List of computed notifications (renewal / trial-end) with category-colored markers, unread state, mark-all-read.
- Reminder preferences: global H- days + channels, and per-subscription overrides.

### Calendar
- Month & week views; each day with a renewal/trial-end shows a colored marker (category color).
- Clicking a date shows a popover list of subscriptions due that day + "add subscription" shortcut.
- Export menu: `.ics` (all / this month) and `.csv` (all / this month).

### Analytics
- Monthly spend trend (line chart), subscription ranking, category & payment-method breakdown, insight cards.

### Settings
- Profile: display name, currency format (`id`/`en`), default currency.
- Payment methods: add/remove free-form favorite methods.
- Notification defaults: global H- days + channels.
- Data management: export JSON backup, import, reset all.

## 3. Component Inventory

| Component | Used in |
|---|---|
| `Sidebar` / `Topbar` (`components/layout`) | Dashboard shell (sticky topbar w/ search + notification bell + language switcher; collapsible sidebar, drawer on mobile) |
| `SubscriptionCard` / `SubscriptionRow` | Subscriptions list (card & list views) |
| `SubscriptionDetailModal` | Card/row/dashboard — read-only detail popup |
| `SubscriptionForm` | Add / Edit subscription |
| `CategoryManagerModal` | Categories CRUD |
| `SubscriptionsProvider` | Central client state (subscriptions, categories, prefs, settings) — the seam for the backend |
| `NotificationBell` / `NotificationDropdown` | Topbar |
| `SummaryCard`, `MiniCalendar`, `UpcomingRenewals`, `DashboardClient` | Dashboard |
| `ChartCard`, `ChartPie` | Dashboard, Analytics |
| `CalendarClient`, `CalendarMonthView`, `CalendarWeekView`, `DateDetailPopover`, `ExportMenu` | Calendar |
| `AnalyticsClient`, `AnalyticsCharts`, `ChartMonthlyTrend`, `ChartSubscriptionRanking`, `InsightCard` | Analytics |
| `ChatPanel`, `ChatComposer`, `ChatMessage`, `ChatMarkdown` | AI chat |
| `ConfirmDialog` | Delete actions anywhere |
| `CategoryBadge`, `BrandLogo`, `EmptyState`, `LoadingSkeleton`, `LanguageSwitcher`, `MobileTabSwitcher` | Shared UI |

## 4. Core UX Flows

### Add a subscription
```
Dashboard / Subscriptions
  → click "+ Tambah Langganan"
  → SubscriptionForm (modal)
  → fill fields; name auto-detects brand + logo
  → next_billing_date / trial_end_date preview
  → submit (addSubscription)
  → modal closes → card appears
```

### View details (no navigation)
```
Any subscription card/row or dashboard renewal row
  → click "Lihat detail" (eye) / click the row
  → SubscriptionDetailModal (portal to <body>) shows name, category, status (Trial pill if trial), price, cycle, dates, payment method, notes
  → close via X / backdrop / Escape
```

### Soft delete + restore
```
Card/row → Delete → ConfirmDialog → soft delete (status=cancelled, deleted_at=now)
  → item shows "deleted" hint + "Pulihkan" (restore)
  → after 14 days auto-purged
```

### Bulk delete
```
Subscriptions → "Pilih banyak" → checkboxes appear → select items
  → bottom bar: "{n} dipilih" + select-all + "Hapus yang dipilih"
  → ConfirmDialog → soft-delete all selected
```

### Export
```
Subscriptions toolbar → "Export" → choose CSV (.csv) or Excel (.xls)
  → downloads langganin-YYYYMMDD.csv / .xls (all subscriptions, not filtered)
```

### Notifications / reminders
```
Preferences (global + per-sub) → generateNotifications() re-scans on every state change
  → bell shows unread count → dropdown lists renewals/trials by H- window
  → mark read / mark all read
```

### AI chat
```
Chat panel (dashboard) → user asks "berapa total pengeluaran bulan ini?"
  → client ships { messages, locale, context: { subscriptions, categories } } to /api/chat
  → streamed assistant reply (OpenRouter)
```

### Global search
```
Topbar search (desktop) → type → live result dropdown (name + price)
  → click result → go to detail; press Enter → /dashboard/subscriptions?q=...
```

## 5. Backend swap checklist (what changes when the DB lands)
- `SubscriptionsProvider` (`components/subscriptions/SubscriptionsProvider.tsx`) is the single seam: replace the in-memory `useState` + localStorage with Server Actions / Route Handlers matching `06-API-CONTRACT.md`, keeping the hook's public API identical.
- `lib/services/billing-dates.ts` moves to server-side (verbatim) for `next_billing_date` / `trial_end_date`.
- `/api/chat` drops the client-shipped `context` in favor of a `user_id`-scoped server query.
- Cron `/api/cron/check-renewals` reads `notification_preferences` + `subscription_overrides` to decide what to send, and logs to `reminder_sends`.
