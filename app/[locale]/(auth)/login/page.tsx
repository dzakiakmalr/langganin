import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import LoginForm from "@/components/auth/LoginForm";
import { Link } from "@/i18n/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ confirmed?: string; error?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Login" });
  return { title: t("title") };
}

export default async function LoginPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Login" });
  const { confirmed, error } = await searchParams;

  return (
    <section className="rounded-card bg-surface p-6 shadow-md sm:p-8">
      <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-sm text-text-muted">{t("description")}</p>

      {confirmed === "true" && (
        <p
          role="status"
          className="mt-5 rounded-[14px] bg-success/10 px-4 py-2.5 text-sm text-success"
        >
          {t("successConfirmed")}
        </p>
      )}
      {error === "confirmation_failed" && (
        <p
          role="alert"
          className="mt-5 rounded-[14px] bg-danger/10 px-4 py-2.5 text-sm text-danger"
        >
          {t("errorConfirmationFailed")}
        </p>
      )}

      <div className="mt-6">
        <LoginForm />
      </div>

      <p className="mt-6 text-sm text-text-muted">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600"
        >
          {t("registerLink")}
        </Link>
      </p>
    </section>
  );
}
