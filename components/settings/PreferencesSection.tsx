"use client";

import { useTranslations } from "next-intl";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import SectionCard from "@/components/settings/SectionCard";
import { useSubscriptions } from "@/components/SubscriptionsProvider";
import { CURRENCIES } from "@/lib/currencies";

export default function PreferencesSection() {
  const t = useTranslations("Settings");
  const { currencyFormat, setCurrencyFormat, defaultCurrency, setDefaultCurrency } =
    useSubscriptions();

  const segmentedClass = (active: boolean) =>
    `rounded-pill px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
      active
        ? "bg-brand-500 text-white shadow-clay"
        : "bg-clay-100 text-text-muted hover:bg-clay-200 hover:text-text"
    }`;

  return (
    <SectionCard
      title={t("preferencesTitle")}
      description={t("preferencesDesc")}
    >
      <div className="space-y-6">
        {/* Language */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text">
              {t("languageLabel")}
            </p>
            <p className="mt-1 text-xs text-text-muted">{t("languageDesc")}</p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Currency / number format */}
        <div>
          <p className="text-sm font-semibold text-text">
            {t("currencyFormatLabel")}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {t("currencyFormatDesc")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={currencyFormat === "id"}
              onClick={() => setCurrencyFormat("id")}
              className={segmentedClass(currencyFormat === "id")}
            >
              {t("currencyFormatId")}
            </button>
            <button
              type="button"
              aria-pressed={currencyFormat === "en"}
              onClick={() => setCurrencyFormat("en")}
              className={segmentedClass(currencyFormat === "en")}
            >
              {t("currencyFormatEn")}
            </button>
          </div>
        </div>

        {/* Default currency */}
        <div>
          <label
            htmlFor="settings-currency"
            className="text-sm font-semibold text-text"
          >
            {t("currencyLabel")}
          </label>
          <p className="mt-1 text-xs text-text-muted">{t("currencyDesc")}</p>
          <select
            id="settings-currency"
            value={defaultCurrency}
            onChange={(e) => setDefaultCurrency(e.target.value)}
            className="mt-3 rounded-pill bg-surface-soft px-4 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </SectionCard>
  );
}
