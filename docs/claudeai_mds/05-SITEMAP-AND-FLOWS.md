# Sitemap, Components & UX Flows — Langganin

## 1. Sitemap

```
Landing (public)
  └─ Login
  └─ Register
Dashboard (auth required)
  ├─ Subscriptions (list/table)
  │    └─ Subscription Detail / Edit
  │    └─ Add Subscription (modal or dedicated page)
  ├─ Calendar
  ├─ Analytics (Phase 3)
  └─ Settings
       ├─ Profile (currency default, timezone, budget cap)
       ├─ Categories
       └─ Notification preferences
```

## 2. Page Contents (so the AI agent doesn't invent layout on its own)

### Dashboard
- Summary cards: total monthly spend, total yearly spend (projected), active subscriptions count.
- "Upcoming renewals" list — next 7 days, then next 30 days as a secondary section.
- Spending-by-category chart (pie or bar).
- Empty state: friendly illustration/message + a prominent "Add your first subscription" button.

### Subscriptions (list)
- Table or card grid (card grid preferred on mobile) showing: logo/icon, name, price, next billing date, status badge.
- Search bar (by name) + filter by category/status.
- "Add Subscription" button, always visible (sticky on mobile).

### Subscription Detail / Edit
- Full form: name, category, price, currency, billing cycle, start date, trial toggle + trial fields, payment method, notes.
- History section (Phase 2+): list of `subscription_events` for this subscription.
- Delete action behind a confirm dialog.

### Calendar
- Month view; each day with a renewal/trial-end shows a small colored dot/badge (color = category color from `04-DESIGN-SYSTEM.md`).
- Clicking a date shows a popover list of subscriptions due that day.

### Analytics (Phase 3)
- Spend trend over time (line chart, fed by `subscription_events`).
- Category breakdown over a selected period.
- "Most expensive" and "least used" (once usage-marking exists) call-outs.

### Settings
- Profile: default currency, timezone, monthly budget cap.
- Categories: add/edit/remove custom categories with color picker.
- Notifications: default reminder days-before, enabled channels (email/push/WhatsApp).

## 3. Component Inventory
Reusable components the AI agent should build once and reuse — don't recreate variants of these per page:

| Component | Used in |
|---|---|
| `Navbar` | All authenticated pages |
| `Sidebar` | Dashboard layout |
| `SubscriptionCard` | Dashboard, Subscriptions list |
| `SummaryCard` | Dashboard |
| `ChartCard` | Dashboard, Analytics |
| `ReminderBadge` | SubscriptionCard, Subscription Detail |
| `CategoryBadge` | SubscriptionCard, filters |
| `CalendarView` | Calendar page |
| `SubscriptionForm` | Add/Edit subscription |
| `CommandPalette` | Global (Cmd+K) — quick add, search, navigate. See `04-DESIGN-SYSTEM.md` §6 |
| `ConfirmDialog` | Delete actions anywhere |
| `EmptyState` | Any list that can be empty |
| `LoadingSkeleton` | Any async-loaded section |

## 4. Core UX Flows

### Add a subscription
```
Dashboard / Subscriptions list
  → click "Add Subscription"
  → SubscriptionForm (modal or page)
  → fill fields, submit
  → validation (inline errors if invalid)
  → save (Server Action)
  → redirect/close modal → back to list
  → toast: "Subscription added"
  → next_billing_date now visible on the card
```

### Trial about to end
```
Cron job runs daily
  → finds subscriptions where trial_end_date - days_before = today
  → sends email reminder
  → user opens app, sees "Trial — ends in 1d" badge (warning color)
  → user either cancels (status → cancelled) or does nothing (trial converts to active on trial_end_date)
```

### Delete a subscription
```
Subscription Detail / card menu
  → click "Delete"
  → ConfirmDialog ("This can't be undone")
  → confirm
  → delete (Server Action)
  → toast: "Subscription removed"
  → removed from list without a full page reload
```

### Quick add via Command Palette
```
Anywhere in the app
  → press Cmd+K / Ctrl+K
  → CommandPalette opens (glass panel, centered)
  → type "add" or subscription name to search
  → select "Add Subscription" → SubscriptionForm opens inline in the palette or as a follow-up modal
  → same save flow as the standard Add Subscription flow above
```
