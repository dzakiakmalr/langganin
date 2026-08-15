CREATE TYPE "public"."billing_cycle" AS ENUM('weekly', 'monthly', 'yearly', 'custom_days');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('whatsapp', 'email', 'google_calendar');--> statement-breakpoint
CREATE TYPE "public"."subscription_event_type" AS ENUM('payment', 'renewed', 'cancelled', 'paused', 'resumed', 'price_changed', 'trial_started', 'trial_converted', 'restored');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'trial', 'paused', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."trial_duration_unit" AS ENUM('days', 'months', 'years');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"icon" text,
	"color" text
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"days_before" integer[] DEFAULT ARRAY[]::integer[] NOT NULL,
	"trial_days_before" integer[] DEFAULT ARRAY[]::integer[] NOT NULL,
	"channels" "notification_channel"[] DEFAULT ARRAY[]::notification_channel[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"currency_format" text DEFAULT 'id' NOT NULL,
	"default_currency" text DEFAULT 'IDR' NOT NULL,
	"payment_methods" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminder_sends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"days_before" integer NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"target_date" date NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_reminder_sends_dedup" UNIQUE("subscription_id","days_before","target_date","channel")
);
--> statement-breakpoint
CREATE TABLE "subscription_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"event_type" "subscription_event_type" NOT NULL,
	"amount" numeric(12, 2),
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "subscription_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"days_before" integer[] DEFAULT ARRAY[]::integer[] NOT NULL,
	"trial_days_before" integer[] DEFAULT ARRAY[]::integer[] NOT NULL,
	"channels" "notification_channel"[] DEFAULT ARRAY[]::notification_channel[] NOT NULL,
	CONSTRAINT "subscription_overrides_subscription_id_unique" UNIQUE("subscription_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid,
	"name" text NOT NULL,
	"logo_url" text,
	"price" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"billing_cycle" "billing_cycle" NOT NULL,
	"custom_cycle_days" integer,
	"start_date" date NOT NULL,
	"next_billing_date" date NOT NULL,
	"status" "subscription_status" NOT NULL,
	"is_trial" boolean DEFAULT false NOT NULL,
	"trial_start_date" date,
	"trial_end_date" date,
	"trial_duration" integer,
	"trial_duration_unit" "trial_duration_unit" DEFAULT 'days' NOT NULL,
	"payment_method" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminder_sends" ADD CONSTRAINT "reminder_sends_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_overrides" ADD CONSTRAINT "subscription_overrides_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_categories_user_id" ON "categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reminder_sends_subscription_target" ON "reminder_sends" USING btree ("subscription_id","target_date");--> statement-breakpoint
CREATE INDEX "idx_subscription_events_subscription_id" ON "subscription_events" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user_id" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_category_id" ON "subscriptions" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_next_billing_date" ON "subscriptions" USING btree ("next_billing_date");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_trial_end_date" ON "subscriptions" USING btree ("trial_end_date");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_status" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_deleted_at" ON "subscriptions" USING btree ("deleted_at");