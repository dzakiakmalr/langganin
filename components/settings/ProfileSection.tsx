"use client";

import { useTranslations } from "next-intl";

import { useSubscriptions } from "@/components/subscriptions/SubscriptionsProvider";
import SectionCard from "@/components/settings/SectionCard";

export default function ProfileSection() {
  const t = useTranslations("Settings");
  const { profileName, setProfileName } = useSubscriptions();
  const initial = (profileName.trim().charAt(0) || "L").toUpperCase();

  return (
    <SectionCard title={t("profileTitle")} description={t("profileDesc")}>
      <div className="flex items-start gap-4">
        <span
          aria-label={t("avatarLabel")}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display text-xl font-bold text-brand-600 shadow-clay"
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <label
            htmlFor="settings-name"
            className="mb-1 block text-sm font-medium text-text"
          >
            {t("nameLabel")}
          </label>
          <input
            id="settings-name"
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="w-full rounded-[14px] bg-surface-soft px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      </div>
    </SectionCard>
  );
}
