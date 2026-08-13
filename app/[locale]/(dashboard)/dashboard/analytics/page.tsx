import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import AnalyticsClient from "@/components/AnalyticsClient";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Analytics" });
  return { title: t("title") };
}

export default async function AnalyticsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AnalyticsClient />;
}
