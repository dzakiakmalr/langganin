"use client";

import { useMemo } from "react";
import {
  addDays,
  format,
  startOfWeek,
} from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { useLocale } from "next-intl";

import type { Category, Subscription } from "@/types/subscription";
import { getRelevantDate } from "@/lib/utils/subscription-dates";

function isCalendarEvent(sub: Subscription): boolean {
  return sub.status === "active" || sub.status === "trial";
}

type CalendarWeekViewProps = {
  subscriptions: Subscription[];
  categories: Category[];
  viewWeek: Date;
  selectedDate: Date;
  today: Date;
  onDayClick: (date: Date, rect?: DOMRect) => void;
};

export default function CalendarWeekView({
  subscriptions,
  categories,
  viewWeek,
  selectedDate,
  today,
  onDayClick,
}: CalendarWeekViewProps) {
  const locale = useLocale();
  const dateFnsLocale = locale === "id" ? idLocale : enUS;

  // 7 days: Sunday through Saturday (matching the month view's Sunday-start grid)
  const weekDays = useMemo(() => {
    const start = startOfWeek(viewWeek, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [viewWeek]);

  // date key → events
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
    <div className="grid grid-cols-7 gap-1">
      {weekDays.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const events = dateMap.get(key) ?? [];
        const isToday = key === todayKey;
        const isSelected = key === selectedKey;
        const dayName = format(day, "EEE", { locale: dateFnsLocale });
        const dayNum = format(day, "d");

        return (
          <div
            key={key}
            role="gridcell"
            className={`flex flex-col rounded-2xl p-3 transition-colors ${
              isToday
                ? "bg-brand-50/60"
                : isSelected
                  ? "bg-clay-100"
                  : "hover:bg-clay-100/50"
            }`}
          >
            {/* Header: day name + date */}
            <button
              type="button"
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                onDayClick(day, rect);
              }}
              className="mb-2 flex flex-col items-center gap-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
              aria-label={format(day, "EEEE, d MMMM", { locale: dateFnsLocale })}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {dayName}
              </span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold tabular-nums ${
                  isToday
                    ? "bg-brand-500 text-white shadow-clay"
                    : "text-text"
                }`}
              >
                {dayNum}
              </span>
            </button>

            {/* Event pills */}
            <div className="flex flex-col gap-1">
              {events.map((e, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 truncate rounded-pill px-2 py-0.5 text-[10px] font-semibold ${
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
              {events.length === 0 && (
                <span className="text-center text-[10px] text-text-subtle">
                  —
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
