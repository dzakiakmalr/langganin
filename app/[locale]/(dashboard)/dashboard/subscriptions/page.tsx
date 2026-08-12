import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import SubscriptionsListClient from "@/components/SubscriptionsListClient";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Subscriptions" });
  return { title: t("title") };
}

export default async function SubscriptionsPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { q } = await searchParams;

  return <SubscriptionsListClient initialQuery={q} />;
}
