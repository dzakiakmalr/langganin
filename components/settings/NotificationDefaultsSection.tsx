"use client";

import { useTranslations } from "next-intl";

import {
  ChannelRow,
  DaysBeforePicker,
} from "@/components/notifications/NotificationSettingsClient";
import SectionCard from "@/components/settings/SectionCard";
import { useSubscriptions } from "@/components/subscriptions/SubscriptionsProvider";
import { Link } from "@/i18n/navigation";
import { NOTIFICATION_CHANNELS } from "@/types/notifications";

export default function NotificationDefaultsSection() {
  const t = useTranslations("Settings");
  const tn = useTranslations("Notifications");
  const { preferences, updateGlobalPreferences } = useSubscriptions();

  return (
    <SectionCard title={t("notifTitle")} description={t("notifDesc")}>
      <div className="mb-5">
        <p className="text-sm font-semibold text-text">
          {tn("daysBeforeLabel")}
        </p>
        <div className="mt-3">
          <DaysBeforePicker
            value={preferences.global.daysBefore}
            onChange={(next) =>
              updateGlobalPreferences({ ...preferences.global, daysBefore: next })
            }
          />
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm font-semibold text-text">
          {tn("trialDaysBeforeLabel")}
        </p>
        <div className="mt-3">
          <DaysBeforePicker
            value={preferences.global.trialDaysBefore}
            onChange={(next) =>
              updateGlobalPreferences({ ...preferences.global, trialDaysBefore: next })
            }
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-text">
          {tn("channelsLabel")}
        </p>
        <div className="mt-3 space-y-2">
          {NOTIFICATION_CHANNELS.map((c) => (
            <ChannelRow
              key={c}
              channel={c}
              active={preferences.global.channels.includes(c)}
              onToggle={() => {
                const next = preferences.global.channels.includes(c)
                  ? preferences.global.channels.filter((x) => x !== c)
                  : [...preferences.global.channels, c];
                updateGlobalPreferences({ ...preferences.global, channels: next });
              }}
            />
          ))}
        </div>
      </div>

      <p className="mt-5 text-xs text-text-muted">
        {t("notifHelper")}{" "}
        <Link
          href="/dashboard/notifications"
          className="font-semibold text-brand-600 underline decoration-brand-500/40 underline-offset-2 hover:decoration-brand-500"
        >
          {t("notifLink")}
        </Link>
      </p>
    </SectionCard>
  );
}
