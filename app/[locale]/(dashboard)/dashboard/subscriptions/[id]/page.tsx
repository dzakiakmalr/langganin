import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import SubscriptionEditClient from "@/components/SubscriptionEditClient";

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SubscriptionDetail" });
  return { title: t("title") };
}

export default async function SubscriptionDetailPage({ params }: PageProps) {
  const p = await params;
  const { locale } = p;
  setRequestLocale(locale);

  return <SubscriptionEditClient id={p.id} />;
}
