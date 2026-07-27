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
  const t = await getTranslations({ locale, namespace: "Register" });
  return { title: t("title") };
}

export default async function RegisterPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Register" });

  return (
    <section>
      <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
      <p className="mt-3 text-text-muted">{t("description")}</p>
      <p className="mt-6 text-sm text-text-muted">
        {t("haveAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
        >
          {t("loginLink")}
        </Link>
      </p>
    </section>
  );
}
