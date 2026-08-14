"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * ID / EN toggle. Glass pill — floating, not clay.
 * Highlight slides via x-transform driven by the active locale, so it only
 * animates on real switches — never spuriously on route changes.
 */
export default function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const activeIndex = routing.locales.indexOf(
    locale as (typeof routing.locales)[number]
  );

  return (
    <div
      role="group"
      aria-label={t("ariaLabel")}
      className="glass-panel rounded-pill p-1"
    >
      <div className="relative flex">
        <motion.span
          aria-hidden
          className="absolute inset-0 w-1/2 rounded-pill bg-brand-500 shadow-clay"
          animate={{ x: activeIndex === 0 ? 0 : "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
        {routing.locales.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={l === locale}
            onClick={() => router.replace(pathname, { locale: l })}
            className="relative z-10 w-1/2 rounded-pill px-2.5 py-1 text-xs font-bold uppercase"
          >
            <span
              className={`transition-colors duration-200 ${
                l === locale ? "text-white" : "text-text-muted hover:text-text"
              }`}
            >
              {l}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
