"use client";

import { useTranslations } from "next-intl";

import SectionCard from "@/components/settings/SectionCard";

const REPO_URL = "https://github.com/dzakiakmalr/langganin";

export default function AboutSection() {
  const t = useTranslations("Settings");
  const tn = useTranslations("Nav");

  return (
    <SectionCard title={t("aboutTitle")} description={t("aboutDesc")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          {t("versionLabel")}:{" "}
          <span className="font-semibold text-text">{tn("tagline")}</span>
        </p>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-brand-600 underline decoration-brand-500/40 underline-offset-2 hover:decoration-brand-500"
        >
          {t("repoLink")}
        </a>
      </div>
    </SectionCard>
  );
}
