"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * ID / EN toggle. Glass pill — floating, not clay.
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
      className="glass-pill flex items-center gap-0.5 rounded-pill p-1"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={l === locale}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`rounded-pill px-2.5 py-1 text-xs font-bold uppercase transition-all duration-200 ${
            l === locale
              ? "bg-primary text-white shadow-card-sm"
              : "text-text-muted hover:text-text hover:bg-white/20"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
