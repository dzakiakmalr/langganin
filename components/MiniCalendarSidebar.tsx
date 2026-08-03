"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  format,
  getDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { Category, Subscription } from "@/types/subscription";
import { getRelevantDate } from "@/lib/utils/subscription-dates";

type MiniCalendarSidebarProps = {
  subscriptions: Subscription[];
  categories: Category[];
  anchorDate: Date;
  onDateSelect: (date: Date) => void;
};

const DAY_NAMES_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isCalendarEvent(sub: Subscription): boolean {
  return sub.status === "active" || sub.status === "trial";
}

export default function MiniCalendarSidebar({
  subscriptions,
  categories,
  anchorDate,
  onDateSelect,
}: MiniCalendarSidebarProps) {
  const t = useTranslations("Calendar");
  const locale = useLocale();
  const dateFnsLocale = locale === "id" ? idLocale : enUS;
  const dayNames = locale === "id" ? DAY_NAMES_ID : DAY_NAMES_EN;

  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(anchorDate));

  // Keep sidebar in sync when parent navigates to a different month
  if (!isSameMonth(viewMonth, anchorDate)) {
    setViewMonth(startOfMonth(anchorDate));
  }

  // 6-week grid, Sunday-aligned
  const days = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const gridStart = addDays(monthStart, -getDay(monthStart));
    const gridEnd = addDays(gridStart, 41);
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth]);

  // event count for the view month
  const monthEventCount = useMemo(() => {
    let count = 0;
    for (const sub of subscriptions) {
      if (!isCalendarEvent(sub)) continue;
      if (isSameMonth(getRelevantDate(sub), viewMonth)) count++;
    }
    return count;
  }, [subscriptions, viewMonth]);

  const monthLabel = format(viewMonth, "MMMM yyyy", { locale: dateFnsLocale });
  const todayKey = format(today, "yyyy-MM-dd");
  const isViewingCurrentMonth = isSameMonth(viewMonth, today);

  function handleDayClick(day: Date) {
    onDateSelect(day);
    if (!isSameMonth(day, viewMonth)) {
      setViewMonth(startOfMonth(day));
    }
  }

  // Compute dateMap for dots
  const dateMap = useMemo(() => {
    const m = new Map<string, { color: string }[]>();
    for (const sub of subscriptions) {
      if (!isCalendarEvent(sub)) continue;
      const d = getRelevantDate(sub);
      const key = format(d, "yyyy-MM-dd");
      const cat = categories.find((c) => c.id === sub.category_id);
      const existing = m.get(key) ?? [];
      existing.push({ color: cat?.color ?? "#8C8884" });
      m.set(key, existing);
    }
    return m;
  }, [subscriptions, categories]);

  return (
    <section
      aria-label={t("title")}
      className="rounded-card bg-surface p-3 shadow-md"
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          aria-label={t("prevMonth")}
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-clay-100 hover:text-text"
        >
          <ChevronLeft size={14} />
        </button>
        <h2 className="min-w-0 flex-1 text-center text-xs font-bold capitalize text-text truncate">
          {monthLabel}
        </h2>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          aria-label={t("nextMonth")}
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-clay-100 hover:text-text"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Stats */}
      <div className="mb-2 flex items-center justify-center gap-1 text-[10px] text-text-muted">
        <CalendarDays size={10} className="text-brand-500" aria-hidden />
        <span className="font-semibold tabular-nums text-text">{monthEventCount}</span>
      </div>

      {/* Day-name strip */}
      <div className="mb-0.5 grid grid-cols-7">
        {dayNames.map((d) => (
          <span
            key={d}
            className="text-center text-[9px] font-semibold uppercase tracking-wider text-text-subtle"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div role="grid" className="grid grid-cols-7 gap-y-0.5">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const events = dateMap.get(key) ?? [];
          const inMonth = isSameMonth(day, viewMonth);
          const isToday = key === todayKey;

          let stateClass = "hover:bg-clay-100";
          if (isToday) stateClass = "bg-brand-500 text-white shadow-clay";

          const numClass = isToday
            ? "text-white"
            : inMonth
              ? "text-text"
              : "text-text-subtle";

          return (
            <div
              key={key}
              role="gridcell"
              className="flex items-center justify-center"
            >
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                aria-label={format(day, "d MMM", { locale: dateFnsLocale })}
                aria-current={isToday ? "date" : undefined}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${stateClass}`}
              >
                <span className={`leading-none ${numClass}`}>{format(day, "d")}</span>
                {events.length > 0 && (
                  <span className="absolute -bottom-0.5 flex gap-0.5">
                    {events.slice(0, 2).map((e, i) => (
                      <span
                        key={i}
                        className="h-1 w-1 rounded-full"
                        style={{
                          backgroundColor: isToday
                            ? "rgba(255,255,255,0.9)"
                            : e.color,
                        }}
                      />
                    ))}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Today link */}
      {!isViewingCurrentMonth && (
        <button
          type="button"
          onClick={() => {
            setViewMonth(startOfMonth(today));
            onDateSelect(today);
          }}
          className="mt-2 block w-full rounded-pill bg-clay-100 py-1.5 text-center text-[11px] font-semibold text-brand-500 transition-colors hover:bg-clay-200"
        >
          {t("today")}
        </button>
      )}
    </section>
  );
}
