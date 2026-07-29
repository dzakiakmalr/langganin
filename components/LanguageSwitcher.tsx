"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * ID / EN toggle. Glass pill — floating, not clay.
 * Active highlight animates smoothly between locales via layoutId.
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
      className="glass-panel relative flex items-center gap-0.5 rounded-pill p-1"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={l === locale}
          onClick={() => router.replace(pathname, { locale: l })}
          className="relative rounded-pill px-2.5 py-1 text-xs font-bold uppercase"
        >
          {l === locale && (
            <motion.div
              layoutId="active-lang"
              className="absolute inset-0 rounded-pill bg-primary clay-card"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span
            className={`relative z-10 transition-colors duration-200 ${
              l === locale ? "text-white" : "text-text-muted hover:text-text"
            }`}
          >
            {l}
          </span>
        </button>
      ))}
    </div>
  );
}
