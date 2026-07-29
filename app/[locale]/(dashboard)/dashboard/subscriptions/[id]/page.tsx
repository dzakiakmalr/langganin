import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

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
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "SubscriptionDetail" });

  return (
    <section className="w-full max-w-4xl">
      <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
      <p className="mt-3 text-text-muted">{t("description")}</p>
      <p className="mt-4 text-sm text-text-muted">
        {t("idLabel")} <span className="font-medium text-text">{id}</span>
      </p>
    </section>
  );
}
