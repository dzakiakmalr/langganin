"use client";

import { useMemo } from "react";
import {
  addDays,
  eachDayOfInterval,
  format,
  getDay,
  isSameMonth,
  startOfMonth,
} from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "next-intl";

import type { Category, Subscription } from "@/types/subscription";
import { getRelevantDate } from "@/lib/utils/subscription-dates";

const DAY_NAMES_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isCalendarEvent(sub: Subscription): boolean {
  return sub.status === "active" || sub.status === "trial";
}

type CalendarMonthViewProps = {
  subscriptions: Subscription[];
  categories: Category[];
  viewMonth: Date;
  selectedDate: Date;
  today: Date;
  onDayClick: (date: Date, rect?: DOMRect) => void;
  keyPrefix: string;
};

export default function CalendarMonthView({
  subscriptions,
  categories,
  viewMonth,
  selectedDate,
  today,
  onDayClick,
  keyPrefix,
}: CalendarMonthViewProps) {
  const locale = useLocale();
  const dateFnsLocale = locale === "id" ? idLocale : enUS;
  const dayNames = locale === "id" ? DAY_NAMES_ID : DAY_NAMES_EN;

  const days = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const gridStart = addDays(monthStart, -getDay(monthStart));
    const gridEnd = addDays(gridStart, 41);
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth]);

  // date key → array of { sub, name, color }
  const dateMap = useMemo(() => {
    const m = new Map<string, { sub: Subscription; name: string; color: string }[]>();
    for (const sub of subscriptions) {
      if (!isCalendarEvent(sub)) continue;
      const d = getRelevantDate(sub);
      const key = format(d, "yyyy-MM-dd");
      const cat = categories.find((c) => c.id === sub.category_id);
      const existing = m.get(key) ?? [];
      existing.push({ sub, name: sub.name, color: cat?.color ?? "#8C8884" });
      m.set(key, existing);
    }
    return m;
  }, [subscriptions, categories]);

  const todayKey = format(today, "yyyy-MM-dd");
  const selectedKey = format(selectedDate, "yyyy-MM-dd");

  return (
    <div className="flex flex-col">
      {/* Day-name strip */}
      <div className="mb-1 grid grid-cols-7">
        {dayNames.map((d) => (
          <span
            key={d}
            className="truncate pb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-text-muted"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div role="grid" className="grid grid-cols-7 gap-px overflow-hidden">
        <AnimatePresence mode="popLayout">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const events = dateMap.get(key) ?? [];
            const inMonth = isSameMonth(day, viewMonth);
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;
            const dayNum = format(day, "d");

            return (
              <motion.div
                key={`${keyPrefix}-${key}`}
                role="gridcell"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.12 }}
                className={`relative flex min-h-[90px] flex-col border-b border-r border-clay-100 p-2 transition-colors ${
                  inMonth
                    ? isToday
                      ? "bg-brand-50/60"
                      : isSelected
                        ? "bg-clay-100"
                        : "hover:bg-clay-100/50"
                    : "bg-clay-100/30"
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    const rect = (e.currentTarget as HTMLElement).closest("[role=gridcell]")?.getBoundingClientRect();
                    onDayClick(day, rect);
                  }}
                  aria-label={`${format(day, "EEEE, d MMMM yyyy", { locale: dateFnsLocale })}${events.length > 0 ? `, ${events.length} acara` : ""}`}
                  className={`mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                    isToday
                      ? "bg-brand-500 text-white shadow-clay"
                      : inMonth
                        ? "text-text hover:bg-clay-200"
                        : "text-text-subtle"
                  }`}
                >
                  {dayNum}
                </button>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {events.slice(0, 4).map((e, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 truncate rounded-pill px-1.5 py-0.5 text-[10px] font-semibold ${
                        e.sub.status === "trial"
                          ? "border border-dashed border-warning/50 bg-warning/5"
                          : ""
                      }`}
                      style={
                        e.sub.status !== "trial"
                          ? {
                              backgroundColor: `${e.color}1a`,
                              color: e.color,
                            }
                          : { color: "#C77B1E" }
                      }
                    >
                      <span
                        className="h-1 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: e.color }}
                      />
                      <span className="truncate">{e.name}</span>
                    </span>
                  ))}
                  {events.length > 4 && (
                    <span className="pl-2 text-[10px] font-semibold text-text-muted">
                      +{events.length - 4}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
