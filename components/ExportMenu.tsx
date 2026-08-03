"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Category, Subscription } from "@/types/subscription";
import { generateICS, downloadFile } from "@/lib/utils/export-ics";
import { generateCSV, downloadCSV } from "@/lib/utils/export-csv";

type ExportMenuProps = {
  subscriptions: Subscription[];
  categories: Category[];
};

export default function ExportMenu({
  subscriptions,
  categories,
}: ExportMenuProps) {
  const t = useTranslations("Calendar");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click-outside closes
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleExport(format: "ics" | "csv", scope: "all" | "month") {
    setOpen(false);
    let subs = subscriptions;
    if (scope === "month") {
      const now = new Date();
      subs = subscriptions.filter((s) => {
        const d = new Date(s.next_billing_date);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      });
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    if (format === "ics") {
      const content = generateICS(subs, categories);
      downloadFile(content, `langganin-${dateStr}.ics`, "text/calendar;charset=utf-8");
    } else {
      const content = generateCSV(subs, categories);
      downloadCSV(content, `langganin-${dateStr}.csv`);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="hidden items-center gap-1.5 rounded-pill bg-clay-100 px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-clay-200 hover:text-text sm:inline-flex"
      >
        <Download size={14} aria-hidden />
        <span>{t("export")}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[240px] overflow-hidden rounded-2xl bg-surface shadow-lg ring-1 ring-clay-100">
          <div className="border-b border-clay-100 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              .ics
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleExport("ics", "all")}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text transition-colors hover:bg-clay-100"
          >
            {t("exportICS")}
          </button>
          <button
            type="button"
            onClick={() => handleExport("ics", "month")}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text transition-colors hover:bg-clay-100"
          >
            <span className="pl-2 text-xs text-text-muted">
              {t("exportMonth")}
            </span>
          </button>
          <div className="border-b border-clay-100 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              .csv
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleExport("csv", "all")}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text transition-colors hover:bg-clay-100"
          >
            {t("exportCSV")}
          </button>
          <button
            type="button"
            onClick={() => handleExport("csv", "month")}
            className="flex w-full items-center gap-2 px-4 py-2.5 pb-3 text-sm text-text transition-colors hover:bg-clay-100"
          >
            <span className="pl-2 text-xs text-text-muted">
              {t("exportMonth")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
