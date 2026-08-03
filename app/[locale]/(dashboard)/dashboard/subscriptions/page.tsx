import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import SubscriptionsListClient from "@/components/SubscriptionsListClient";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Subscriptions" });
  return { title: t("title") };
}

export default async function SubscriptionsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SubscriptionsListClient />;
}
