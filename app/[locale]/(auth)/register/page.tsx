import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import SignUpForm from "@/components/auth/SignUpForm";
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
    <section className="rounded-card bg-surface p-6 shadow-md sm:p-8">
      <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-sm text-text-muted">{t("description")}</p>

      <div className="mt-6">
        <SignUpForm />
      </div>

      <p className="mt-6 text-sm text-text-muted">
        {t("haveAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600"
        >
          {t("loginLink")}
        </Link>
      </p>
    </section>
  );
}
