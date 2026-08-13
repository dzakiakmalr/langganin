"use client";

import { motion } from "framer-motion";
import { BarChart3, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

export type MobileTab = "summary" | "chat";

type MobileTabSwitcherProps = {
  value: MobileTab;
  onChange: (next: MobileTab) => void;
};

// Pill sliding indicator — mirrors the CalendarClient month/week toggle
// pattern (framer-motion `layoutId` for the brand-500 pill behind the
// active button). Only rendered on mobile (lg:hidden in the parent).
export default function MobileTabSwitcher({
  value,
  onChange,
}: MobileTabSwitcherProps) {
  const t = useTranslations("Analytics");
  const tabs: { key: MobileTab; label: string; Icon: typeof BarChart3 }[] = [
    { key: "summary", label: t("tabSummary"), Icon: BarChart3 },
    { key: "chat", label: t("tabChat"), Icon: MessageSquare },
  ];

  return (
    <div
      role="tablist"
      aria-label="Analytics sections"
      className="glass-panel-sm relative inline-flex w-full items-center gap-0.5 rounded-pill p-1"
    >
      {tabs.map(({ key, label, Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`analytics-tab-panel-${key}`}
            onClick={() => onChange(key)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-pill px-3 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
              active ? "text-white" : "text-text-muted hover:text-text"
            }`}
          >
            {active && (
              <motion.span
                layoutId="analytics-mobile-tab-pill"
                className="absolute inset-0 rounded-pill bg-brand-500 shadow-clay"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon size={14} className="relative z-10" aria-hidden />
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
