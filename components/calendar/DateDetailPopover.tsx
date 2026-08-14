"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

import type { Category, Subscription } from "@/types/subscription";
import { formatIdr } from "@/lib/utils/format-currency";
import { Link } from "@/i18n/navigation";

const CYCLE_SUB: Record<string, string> = {
  weekly: "/mg",
  monthly: "/bln",
  yearly: "/thn",
  custom_days: "",
};

const PADDING = 12;
const GAP = 8;

type DateDetailPopoverProps = {
  date: Date;
  events: { sub: Subscription; name: string; color: string }[];
  categories: Category[];
  anchorRect?: DOMRect;
  onClose: () => void;
  onAddSubscription: (date: Date) => void;
};

export default function DateDetailPopover({
  date,
  events,
  categories,
  anchorRect,
  onClose,
  onAddSubscription,
}: DateDetailPopoverProps) {
  const t = useTranslations("Calendar");
  const locale = useLocale();
  const dateFnsLocale = locale === "id" ? idLocale : enUS;
  const popoverRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  // Compute smart position on mount — try below, flip above if clipped
  useEffect(() => {
    const el = popoverRef.current;
    if (!el || !anchorRect) {
      // Fallback center-screen
      setPopoverStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 50,
      });
      return;
    }

    // Need to measure after render. Use requestAnimationFrame.
    const raf = requestAnimationFrame(() => {
      const popW = el.offsetWidth;
      const popH = el.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left = anchorRect.left + anchorRect.width / 2 - popW / 2;
      // Clamp horizontally
      if (left < PADDING) left = PADDING;
      if (left + popW > vw - PADDING) left = vw - popW - PADDING;

      // Try below first
      let top = anchorRect.bottom + GAP;
      let dir: "bottom" | "top" = "bottom";
      if (top + popH > vh - PADDING) {
        // Flip above
        top = anchorRect.top - popH - GAP;
        dir = "top";
      }
      // Clamp vertically
      if (top < PADDING) top = PADDING;
      if (top + popH > vh - PADDING) top = vh - popH - PADDING;

      setPlacement(dir);
      setPopoverStyle({
        position: "fixed",
        top,
        left,
        zIndex: 50,
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [anchorRect]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Focus the popover on open
  useEffect(() => {
    popoverRef.current?.focus();
  }, []);

  const dateLabel = format(date, "EEEE, d MMMM yyyy", {
    locale: dateFnsLocale,
  });

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />

      <motion.div
        ref={popoverRef}
        role="dialog"
        aria-label={`${t("title")} — ${dateLabel}`}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95, y: placement === "bottom" ? -4 : 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: placement === "bottom" ? -4 : 4 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        style={popoverStyle}
        className="glass-panel-lg w-[360px] max-w-[calc(100vw-2rem)] rounded-card p-5 shadow-lg"
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold capitalize text-text">
              {dateLabel}
            </h3>
            {events.length > 0 && (
              <p className="mt-0.5 text-xs text-text-muted">
                {t("dayEvents", { count: events.length })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-clay-100 hover:text-text"
          >
            <X size={14} />
          </button>
        </div>

        {/* Empty state */}
        {events.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-text-muted">{t("noEvents")}</p>
            <button
              type="button"
              onClick={() => {
                onAddSubscription(date);
                onClose();
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              <Plus size={14} />
              {t("addSubscription")}
            </button>
          </div>
        ) : (
          /* Event list */
          <ul className="space-y-2">
            {events.map((e) => {
              const { sub, color } = e;
              const cat = categories.find((c) => c.id === sub.category_id);
              const cycleSub = CYCLE_SUB[sub.billing_cycle] ?? "";
              return (
                <li key={sub.id}>
                  <Link
                    href={`/dashboard/subscriptions/${sub.id}`}
                    className="group flex flex-col gap-1 rounded-[12px] bg-clay-100 px-3 py-2.5 transition-colors hover:bg-clay-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                        <span className="truncate text-sm font-semibold text-text">
                          {sub.name}
                        </span>
                        {sub.status === "trial" && (
                          <span className="shrink-0 rounded-pill border border-dashed border-warning/40 bg-warning/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-warning">
                            Trial
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-text">
                        {formatIdr(sub.price)}
                        {cycleSub && (
                          <span className="text-xs text-text-muted">
                            {cycleSub}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pl-4.5 text-xs text-text-muted">
                      {cat?.name && <span>{cat.name}</span>}
                      <span className="text-brand-500 opacity-0 transition-opacity group-hover:opacity-100">
                        · {t("viewDetail")}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </motion.div>
    </>
  );
}
