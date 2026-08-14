"use client";

import { useTranslations } from "next-intl";

import AboutSection from "@/components/settings/AboutSection";
import DataManagementSection from "@/components/settings/DataManagementSection";
import NotificationDefaultsSection from "@/components/settings/NotificationDefaultsSection";
import PaymentMethodsSection from "@/components/settings/PaymentMethodsSection";
import PreferencesSection from "@/components/settings/PreferencesSection";
import ProfileSection from "@/components/settings/ProfileSection";

export default function SettingsClient() {
  const t = useTranslations("Settings");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          {t("description")}
        </p>
      </header>

      <ProfileSection />
      <PreferencesSection />
      <NotificationDefaultsSection />
      <PaymentMethodsSection />
      <DataManagementSection />
      <AboutSection />
    </div>
  );
}
