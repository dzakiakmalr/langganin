import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgPolicy,
  pgRole,
  pgSchema,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const billingCycleEnum = pgEnum("billing_cycle", [
  "weekly",
  "monthly",
  "yearly",
  "custom_days",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trial",
  "paused",
  "cancelled",
]);

export const trialDurationUnitEnum = pgEnum("trial_duration_unit", [
  "days",
  "months",
  "years",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "whatsapp",
  "email",
  "google_calendar",
]);

export const subscriptionEventTypeEnum = pgEnum("subscription_event_type", [
  "payment",
  "renewed",
  "cancelled",
  "paused",
  "resumed",
  "price_changed",
  "trial_started",
  "trial_converted",
  "restored",
]);

// ---------------------------------------------------------------------------
// Supabase `auth.users` (cross-schema reference)
//
// profiles.id is a real FK to auth.users.id, so user deletion cascades.
// drizzle-kit only emits the FK reference — it does not create auth.users,
// because that table lives in a schema Supabase already owns.
// ---------------------------------------------------------------------------
const auth = pgSchema("auth");

export const authUsers = auth.table("users", {
  id: uuid("id").primaryKey(),
});

// ---------------------------------------------------------------------------
// Row-Level Security (RLS)
//
// Supabase does NOT enable RLS automatically on tables created by a Drizzle
// migration. These policies ensure a user can only read/write rows they own
// (auth.uid()). The service_role key (cron / admin) still bypasses RLS.
// Child tables without a user_id column resolve ownership via subscriptions.
// ---------------------------------------------------------------------------

const authenticatedRole = pgRole("authenticated").existing();

function ownDataPolicy(userCol: "id" | "user_id") {
  return pgPolicy("own_data_policy", {
    as: "permissive",
    for: "all",
    to: authenticatedRole,
    using: sql`auth.uid() = ${sql.raw(userCol)}`,
    withCheck: sql`auth.uid() = ${sql.raw(userCol)}`,
  });
}

function subscriptionOwnedPolicy() {
  return pgPolicy("subscription_owned_policy", {
    as: "permissive",
    for: "all",
    to: authenticatedRole,
    using: sql`EXISTS (SELECT 1 FROM subscriptions s WHERE s.id = subscription_id AND s.user_id = auth.uid())`,
    withCheck: sql`EXISTS (SELECT 1 FROM subscriptions s WHERE s.id = subscription_id AND s.user_id = auth.uid())`,
  });
}

// ---------------------------------------------------------------------------
// profiles — per-user settings (managed by Supabase Auth)
// ---------------------------------------------------------------------------

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    full_name: text("full_name").notNull(),
    currency_format: text("currency_format").notNull().default("id"),
    default_currency: text("default_currency").notNull().default("IDR"),
    payment_methods: text("payment_methods")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  () => [ownDataPolicy("id")],
).enableRLS();

// ---------------------------------------------------------------------------
// categories — null user_id = global/default category (read-only)
// ---------------------------------------------------------------------------

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id").references(() => profiles.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    icon: text("icon"),
    color: text("color"),
  },
  (t) => [
    index("idx_categories_user_id").on(t.user_id),
    pgPolicy("categories_select", {
      for: "select",
      to: authenticatedRole,
      using: sql`user_id IS NULL OR auth.uid() = user_id`,
    }),
    ownDataPolicy("user_id"),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// subscriptions
// ---------------------------------------------------------------------------

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    category_id: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    logo_url: text("logo_url"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("IDR"),
    billing_cycle: billingCycleEnum("billing_cycle").notNull(),
    custom_cycle_days: integer("custom_cycle_days"),
    start_date: date("start_date").notNull(),
    next_billing_date: date("next_billing_date").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    is_trial: boolean("is_trial").notNull().default(false),
    trial_start_date: date("trial_start_date"),
    trial_end_date: date("trial_end_date"),
    trial_duration: integer("trial_duration"),
    trial_duration_unit: trialDurationUnitEnum("trial_duration_unit")
      .notNull()
      .default("days"),
    payment_method: text("payment_method").notNull(),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_subscriptions_user_id").on(t.user_id),
    index("idx_subscriptions_category_id").on(t.category_id),
    index("idx_subscriptions_next_billing_date").on(t.next_billing_date),
    index("idx_subscriptions_trial_end_date").on(t.trial_end_date),
    index("idx_subscriptions_status").on(t.status),
    index("idx_subscriptions_deleted_at").on(t.deleted_at),
    ownDataPolicy("user_id"),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// notification_preferences — global defaults, one row per user
// ---------------------------------------------------------------------------

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    user_id: uuid("user_id")
      .primaryKey()
      .references(() => profiles.id, { onDelete: "cascade" }),
    days_before: integer("days_before")
      .array()
      .notNull()
      .default(sql`ARRAY[]::integer[]`),
    trial_days_before: integer("trial_days_before")
      .array()
      .notNull()
      .default(sql`ARRAY[]::integer[]`),
    channels: notificationChannelEnum("channels")
      .array()
      .notNull()
      .default(sql`ARRAY[]::notification_channel[]`),
  },
  () => [ownDataPolicy("user_id")],
).enableRLS();

// ---------------------------------------------------------------------------
// subscription_overrides — per-subscription overrides
// ---------------------------------------------------------------------------

export const subscriptionOverrides = pgTable(
  "subscription_overrides",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subscription_id: uuid("subscription_id")
      .notNull()
      .unique()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    days_before: integer("days_before")
      .array()
      .notNull()
      .default(sql`ARRAY[]::integer[]`),
    trial_days_before: integer("trial_days_before")
      .array()
      .notNull()
      .default(sql`ARRAY[]::integer[]`),
    channels: notificationChannelEnum("channels")
      .array()
      .notNull()
      .default(sql`ARRAY[]::notification_channel[]`),
  },
  () => [subscriptionOwnedPolicy()],
).enableRLS();

// ---------------------------------------------------------------------------
// reminder_sends — dedup log so the cron never double-sends
// ---------------------------------------------------------------------------

export const reminderSends = pgTable(
  "reminder_sends",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subscription_id: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    days_before: integer("days_before").notNull(),
    channel: notificationChannelEnum("channel").notNull(),
    target_date: date("target_date").notNull(),
    sent_at: timestamp("sent_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("idx_reminder_sends_subscription_target").on(
      t.subscription_id,
      t.target_date,
    ),
    unique("uq_reminder_sends_dedup").on(
      t.subscription_id,
      t.days_before,
      t.target_date,
      t.channel,
    ),
    subscriptionOwnedPolicy(),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// subscription_events — append-only history (powers Analytics)
// ---------------------------------------------------------------------------

export const subscriptionEvents = pgTable(
  "subscription_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subscription_id: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    event_type: subscriptionEventTypeEnum("event_type").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }),
    occurred_at: timestamp("occurred_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    note: text("note"),
  },
  (t) => [
    index("idx_subscription_events_subscription_id").on(t.subscription_id),
    subscriptionOwnedPolicy(),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  categories: many(categories),
  subscriptions: many(subscriptions),
  notificationPreferences: one(notificationPreferences),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [categories.user_id],
    references: [profiles.id],
  }),
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [subscriptions.user_id],
    references: [profiles.id],
  }),
  category: one(categories, {
    fields: [subscriptions.category_id],
    references: [categories.id],
  }),
  override: one(subscriptionOverrides),
  reminderSends: many(reminderSends),
  events: many(subscriptionEvents),
}));

export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    profile: one(profiles, {
      fields: [notificationPreferences.user_id],
      references: [profiles.id],
    }),
  }),
);

export const subscriptionOverridesRelations = relations(
  subscriptionOverrides,
  ({ one }) => ({
    subscription: one(subscriptions, {
      fields: [subscriptionOverrides.subscription_id],
      references: [subscriptions.id],
    }),
  }),
);

export const reminderSendsRelations = relations(reminderSends, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [reminderSends.subscription_id],
    references: [subscriptions.id],
  }),
}));

export const subscriptionEventsRelations = relations(
  subscriptionEvents,
  ({ one }) => ({
    subscription: one(subscriptions, {
      fields: [subscriptionEvents.subscription_id],
      references: [subscriptions.id],
    }),
  }),
);
