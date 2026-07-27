import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Login" });
  return { title: t("title") };
}

export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Login" });

  return (
    <section>
      <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
      <p className="mt-3 text-text-muted">{t("description")}</p>
      <p className="mt-6 text-sm text-text-muted">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
        >
          {t("registerLink")}
        </Link>
      </p>
    </section>
  );
}
