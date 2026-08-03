"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { Category, Subscription } from "@/types/subscription";
import { formatIdr } from "@/lib/utils/format-currency";
import { getRelevantDate } from "@/lib/utils/subscription-dates";

type MiniCalendarProps = {
  subscriptions: Subscription[];
  categories: Category[];
};

const DAY_NAMES_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Pm = { id: string; en: string };
const PM_LABEL: Record<string, Pm> = {
  credit_card: { id: "Kartu Kredit", en: "Credit Card" },
  debit_card: { id: "Kartu Debit", en: "Debit Card" },
  gopay: { id: "GoPay", en: "GoPay" },
  ovo: { id: "OVO", en: "OVO" },
  dana: { id: "DANA", en: "DANA" },
  shopeepay: { id: "ShopeePay", en: "ShopeePay" },
  qris: { id: "QRIS", en: "QRIS" },
  bank_transfer: { id: "Transfer Bank", en: "Bank Transfer" },
  other: { id: "Lainnya", en: "Other" },
};

function isCalendarEvent(sub: Subscription): boolean {
  return sub.status === "active" || sub.status === "trial";
}

export default function MiniCalendar({
  subscriptions,
  categories,
}: MiniCalendarProps) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const dateFnsLocale = locale === "id" ? idLocale : enUS;
  const dayNames = locale === "id" ? DAY_NAMES_ID : DAY_NAMES_EN;

  const today = useMemo(() => startOfDay(new Date()), []);

  const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // 6-week grid (always 42 cells) for the view month, Sunday-aligned
  const days = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const gridStart = addDays(monthStart, -getDay(monthStart));
    const gridEnd = addDays(gridStart, 41);
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth]);

  // date key → events for that day
  const dateMap = useMemo(() => {
    const m = new Map<
      string,
      { sub: Subscription; name: string; color: string }[]
    >();
    for (const sub of subscriptions) {
      if (!isCalendarEvent(sub)) continue;
      const d = getRelevantDate(sub);
      const key = format(d, "yyyy-MM-dd");
      const cat = categories.find((c) => c.id === sub.category_id);
      const existing = m.get(key) ?? [];
      existing.push({
        sub,
        name: sub.name,
        color: cat?.color ?? "#8C8884",
      });
      m.set(key, existing);
    }
    return m;
  }, [subscriptions, categories]);

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDayEvents = dateMap.get(selectedDateKey) ?? [];

  const monthEventCount = useMemo(() => {
    let count = 0;
    for (const sub of subscriptions) {
      if (!isCalendarEvent(sub)) continue;
      if (isSameMonth(getRelevantDate(sub), viewMonth)) count++;
    }
    return count;
  }, [subscriptions, viewMonth]);

  const monthLabel = format(viewMonth, "MMMM yyyy", {
    locale: dateFnsLocale,
  });
  const selectedDateLabel = format(selectedDate, "EEEE, d MMMM yyyy", {
    locale: dateFnsLocale,
  });
  const todayKey = format(today, "yyyy-MM-dd");
  const isViewingCurrentMonth = isSameMonth(viewMonth, today);

  function handleDayClick(day: Date) {
    setSelectedDate(day);
    if (!isSameMonth(day, viewMonth)) {
      setViewMonth(startOfMonth(day));
    }
  }
  function handlePrevMonth() {
    setViewMonth((m) => subMonths(m, 1));
  }
  function handleNextMonth() {
    setViewMonth((m) => addMonths(m, 1));
  }
  function handleGoToday() {
    setViewMonth(startOfMonth(today));
    setSelectedDate(today);
  }

  const controlBtn =
    "flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-clay-100 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40";
  const chipBtn =
    "rounded-pill px-2.5 py-1 text-xs font-semibold text-brand-500 transition-colors hover:bg-brand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
      {/* ── Calendar card ──────────────────────────────────────── */}
      <section
        aria-label={t("calendarTitle")}
        className="rounded-card bg-surface p-4 shadow-md"
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-bold capitalize text-text">
            {monthLabel}
          </h2>
          <div className="flex items-center gap-1">
            {!isViewingCurrentMonth && (
              <button
                type="button"
                onClick={handleGoToday}
                className={chipBtn}
              >
                {t("goToday")}
              </button>
            )}
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label={t("prevMonth")}
              className={controlBtn}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label={t("nextMonth")}
              className={controlBtn}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Events-this-month chip */}
        <div className="mb-3 flex items-center gap-1.5 text-xs text-text-muted">
          <CalendarDays size={12} className="text-brand-500" aria-hidden />
          <span className="font-semibold tabular-nums text-text">
            {monthEventCount}
          </span>
          <span>{t("eventsThisMonth", { count: monthEventCount })}</span>
        </div>

        {/* Day-name strip */}
        <div className="mb-1 grid grid-cols-7">
          {dayNames.map((d) => (
            <span
              key={d}
              className="text-center text-[10px] font-semibold uppercase tracking-wider text-text-subtle"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Day grid (6 rows × 7 cols) */}
        <div role="grid" className="grid grid-cols-7 gap-y-0.5">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const events = dateMap.get(key) ?? [];
            const inMonth = isSameMonth(day, viewMonth);
            const isToday = key === todayKey;
            const isSelected = isSameDay(day, selectedDate);

            let stateClass = "hover:bg-clay-100";
            if (isToday) {
              stateClass = "bg-brand-500 text-white shadow-clay";
            } else if (isSelected) {
              stateClass = "bg-brand-100 ring-2 ring-brand-500/40";
            } else if (!inMonth) {
              stateClass = "hover:bg-clay-100";
            }

            const numClass = isToday
              ? "text-white"
              : isSelected
                ? "text-brand-600 font-semibold"
                : inMonth
                  ? "text-text"
                  : "text-text-subtle";

            const ariaLabel = `${format(day, "EEEE, d MMMM yyyy", { locale: dateFnsLocale })}${
              events.length > 0
                ? `, ${events.length} ${locale === "id" ? "acara" : "events"}`
                : ""
            }`;

            return (
              <div
                key={key}
                role="gridcell"
                className="flex items-center justify-center"
              >
                <button
                  type="button"
                  onClick={() => handleDayClick(day)}
                  aria-label={ariaLabel}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={isSelected}
                  className={`relative flex h-9 w-9 flex-col items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${stateClass}`}
                >
                  <span
                    className={`text-sm leading-none tabular-nums ${numClass}`}
                  >
                    {format(day, "d")}
                  </span>
                  {events.length > 0 && (
                    <span className="mt-0.5 flex items-center justify-center gap-0.5">
                      {events.slice(0, 3).map((e, i) => (
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
      </section>

      {/* ── Day-detail card ──────────────────────────────────────── */}
      <section
        aria-label={t("selectedDay")}
        className="rounded-card bg-surface p-4 shadow-md"
      >
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-bold capitalize text-text">
            {selectedDateLabel}
          </h2>
          {selectedDayEvents.length > 0 && (
            <span className="rounded-pill bg-brand-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-brand-600">
              {selectedDayEvents.length}
            </span>
          )}
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-3xl" aria-hidden>
              📅
            </span>
            <p className="mt-3 text-sm text-text-muted">
              {t("noEventsOnDay")}
            </p>
            <p className="mt-1 text-xs text-text-subtle">
              {t("noEventsHint")}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {selectedDayEvents.map((evt) => {
              const { sub, color } = evt;
              const cat = categories.find((c) => c.id === sub.category_id);
              const pm = PM_LABEL[sub.payment_method] ?? PM_LABEL.other;
              const pmDisplay = locale === "id" ? pm.id : pm.en;
              return (
                <li
                  key={sub.id}
                  className="rounded-[14px] bg-clay-100 px-4 py-3 transition-colors hover:bg-clay-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                        aria-hidden
                      />
                      <span className="truncate text-sm font-semibold text-text">
                        {sub.name}
                      </span>
                      {sub.status === "trial" && (
                        <span className="shrink-0 rounded-pill bg-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning">
                          Trial
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-text">
                      {formatIdr(sub.price)}
                    </span>
                  </div>
                  <p className="mt-1 truncate pl-5 text-xs text-text-muted">
                    {cat?.name ?? "—"} · {pmDisplay}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
