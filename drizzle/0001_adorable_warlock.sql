ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reminder_sends" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscription_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscription_overrides" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "categories_select" ON "categories" AS PERMISSIVE FOR SELECT TO "authenticated" USING (user_id IS NULL OR auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "own_data_policy" ON "categories" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "own_data_policy" ON "notification_preferences" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "own_data_policy" ON "profiles" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = id) WITH CHECK (auth.uid() = id);--> statement-breakpoint
CREATE POLICY "subscription_owned_policy" ON "reminder_sends" AS PERMISSIVE FOR ALL TO "authenticated" USING (EXISTS (SELECT 1 FROM subscriptions s WHERE s.id = subscription_id AND s.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM subscriptions s WHERE s.id = subscription_id AND s.user_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "subscription_owned_policy" ON "subscription_events" AS PERMISSIVE FOR ALL TO "authenticated" USING (EXISTS (SELECT 1 FROM subscriptions s WHERE s.id = subscription_id AND s.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM subscriptions s WHERE s.id = subscription_id AND s.user_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "subscription_owned_policy" ON "subscription_overrides" AS PERMISSIVE FOR ALL TO "authenticated" USING (EXISTS (SELECT 1 FROM subscriptions s WHERE s.id = subscription_id AND s.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM subscriptions s WHERE s.id = subscription_id AND s.user_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "own_data_policy" ON "subscriptions" AS PERMISSIVE FOR ALL TO "authenticated" USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);