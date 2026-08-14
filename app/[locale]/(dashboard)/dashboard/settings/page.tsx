import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import SettingsClient from "@/components/settings/SettingsClient";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Settings" });
  return { title: t("title"), description: t("description") };
}

export default async function SettingsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-3xl">
      <SettingsClient />
    </div>
  );
}
