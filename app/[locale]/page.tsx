import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          Langganin
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-text-muted">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-pill bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            {t("login")}
          </Link>
          <Link
            href="/register"
            className="rounded-pill bg-clay-surface px-6 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-primary-tint"
          >
            {t("register")}
          </Link>
        </div>
        <p className="mt-8 text-sm text-text-muted">
          <Link
            href="/dashboard"
            className="underline underline-offset-4 hover:text-primary"
          >
            {t("viewDashboard")}
          </Link>
        </p>
      </div>
    </main>
  );
}
