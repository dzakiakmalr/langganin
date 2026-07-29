import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import PlaceholderPage from "@/components/PlaceholderPage";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Calendar" });
  return { title: t("title") };
}

export default async function CalendarPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Calendar" });

  return <PlaceholderPage title={t("title")} description={t("description")} />;
}
