"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * ID / EN toggle in the top bar. Switching keeps the user on the same page —
 * only the locale prefix changes (Indonesian stays unprefixed).
 */
export default function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label={t("ariaLabel")}
      className="flex items-center gap-0.5 rounded-pill bg-clay-surface p-1"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={l === locale}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`rounded-pill px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
            l === locale
              ? "bg-primary text-white"
              : "text-text-muted hover:text-text"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
