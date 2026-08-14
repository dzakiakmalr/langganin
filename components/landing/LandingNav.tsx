import { getTranslations } from "next-intl/server";

import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { Link } from "@/i18n/navigation";

export default async function LandingNav({
  locale,
}: {
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <nav className="fixed inset-x-0 top-0 z-50">
      <div className="glass-panel">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/LN.png" alt="Langganin" className="h-7 w-7" />
            <img src="/Langganin.png" alt="Langganin" className="hidden h-5 sm:block" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="rounded-pill px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-clay-100 sm:px-5"
            >
              {t("navLogin")}
            </Link>
            <Link
              href="/register"
              className="rounded-pill bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover sm:px-5"
            >
              {t("navSignUp")}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
