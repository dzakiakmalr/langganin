import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import NotificationSettingsClient from "@/components/NotificationSettingsClient";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Notifications" });
  return { title: t("title") };
}

export default async function NotificationSettingsPage({
  params,
}: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Notifications" });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <h1 className="sr-only">{t("settingsTitle")}</h1>
        <p className="text-sm text-text-muted">{t("description")}</p>
      </div>
      <NotificationSettingsClient />
    </div>
  );
}
