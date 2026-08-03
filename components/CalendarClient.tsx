"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  addWeeks,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown, Plus } from "lucide-react";

import { useSubscriptions } from "@/components/SubscriptionsProvider";
import CalendarMonthView from "@/components/CalendarMonthView";
import CalendarWeekView from "@/components/CalendarWeekView";
import DateDetailPopover from "@/components/DateDetailPopover";
import ExportMenu from "@/components/ExportMenu";
import SubscriptionForm from "@/components/SubscriptionForm";
import type { SubscriptionInput } from "@/components/SubscriptionsProvider";
import { getRelevantDate } from "@/lib/utils/subscription-dates";
import { normalizeMonthlyPrice } from "@/lib/utils/subscription-math";
import { formatIdr } from "@/lib/utils/format-currency";
import { Link } from "@/i18n/navigation";

type ViewMode = "month" | "week";

export default function CalendarClient() {
  const t = useTranslations("Calendar");
  const tf = useTranslations("SubscriptionForm");
  const locale = useLocale();
  const dateFnsLocale = locale === "id" ? idLocale : enUS;
  const { subscriptions, categories, addSubscription } = useSubscriptions();

  const today = useMemo(() => startOfDay(new Date()), []);

  const [anchorDate, setAnchorDate] = useState<Date>(today);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [navDirection, setNavDirection] = useState<"prev" | "next">("next");

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | undefined>();

  const [legendOpen, setLegendOpen] = useState(false);

  // Add-subscription modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [prefillDate, setPrefillDate] = useState<string>("");

  const viewMonth = useMemo(() => startOfMonth(anchorDate), [anchorDate]);
  const viewWeek = useMemo(
    () => startOfWeek(anchorDate, { weekStartsOn: 0 }),
    [anchorDate],
  );

  // Monthly spend estimate
  const monthlyTotal = useMemo(() => {
    return subscriptions
      .filter(
        (s) => s.status === "active" || s.status === "trial",
      )
      .reduce(
        (sum, s) =>
          sum +
          normalizeMonthlyPrice(
            s.price,
            s.billing_cycle,
            s.custom_cycle_days,
          ),
        0,
      );
  }, [subscriptions]);

  const monthlyTotalStr = formatIdr(Math.round(monthlyTotal));

  // Selected day events
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    const result: {
      name: string;
      color: string;
      sub: (typeof subscriptions)[number];
    }[] = [];
    for (const sub of subscriptions) {
      if (sub.status !== "active" && sub.status !== "trial") continue;
      const d = getRelevantDate(sub);
      if (format(d, "yyyy-MM-dd") !== key) continue;
      const cat = categories.find((c) => c.id === sub.category_id);
      result.push({
        sub,
        name: sub.name,
        color: cat?.color ?? "#8C8884",
      });
    }
    return result;
  }, [selectedDate, subscriptions, categories]);

  function handleDayClick(date: Date, rect?: DOMRect) {
    setSelectedDate(date);
    setPopoverAnchor(rect);
  }

  function closePopover() {
    setSelectedDate(null);
    setPopoverAnchor(undefined);
  }

  function handlePrev() {
    setNavDirection("prev");
    if (viewMode === "month") setAnchorDate((d) => subMonths(d, 1));
    else setAnchorDate((d) => subWeeks(d, 1));
  }

  function handleNext() {
    setNavDirection("next");
    if (viewMode === "month") setAnchorDate((d) => addMonths(d, 1));
    else setAnchorDate((d) => addWeeks(d, 1));
  }

  function handleGoToday() {
    setNavDirection("next");
    setAnchorDate(today);
    setSelectedDate(null);
  }

  function handleAddWithDate(date: Date) {
    setPrefillDate(format(date, "yyyy-MM-dd"));
    setShowAddModal(true);
  }

  function handleAdd(data: SubscriptionInput) {
    addSubscription(data);
    setShowAddModal(false);
  }

  const headerLabel =
    viewMode === "month"
      ? format(anchorDate, "MMMM yyyy", { locale: dateFnsLocale })
      : (() => {
          const weekStart = startOfWeek(anchorDate, { weekStartsOn: 0 });
          const weekEnd = format(
            new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
            "d MMM yyyy",
            { locale: dateFnsLocale },
          );
          return `${format(weekStart, "d", { locale: dateFnsLocale })} – ${weekEnd}`;
        })();

  const controlBtn =
    "flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-clay-100 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40";

  // Empty state
  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl" aria-hidden>
          📅
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-text">
          {t("emptyTitle")}
        </h2>
        <p className="mt-2 max-w-md text-sm text-text-muted">
          {t("emptyDescription")}
        </p>
        <Link
          href="/dashboard/subscriptions"
          className="mt-6 inline-flex items-center gap-2 rounded-pill bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover"
        >
          <Plus size={16} />
          {t("emptyAction")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            aria-label={
              viewMode === "month" ? t("prevMonth") : t("prevWeek")
            }
            className={controlBtn}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label={
              viewMode === "month" ? t("nextMonth") : t("nextWeek")
            }
            className={controlBtn}
          >
            <ChevronRight size={18} />
          </button>
          <h1 className="mx-2 text-center font-display text-lg font-bold capitalize text-text sm:text-xl">
            {headerLabel}
          </h1>
          <span className="text-sm font-semibold tabular-nums text-text-muted">
            {t("totalMonthly", { total: monthlyTotalStr })}
          </span>
          <button
            type="button"
            onClick={handleGoToday}
            className="rounded-pill bg-clay-100 px-3 py-1.5 text-xs font-semibold text-brand-500 transition-colors hover:bg-clay-200"
          >
            {t("today")}
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* View toggle */}
          <div
            role="group"
            aria-label="Tampilan kalender"
            className="glass-panel-sm relative flex items-center gap-0.5 rounded-pill p-1"
          >
            <button
              type="button"
              aria-pressed={viewMode === "month"}
              onClick={() => setViewMode("month")}
              className="relative flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-semibold text-text-muted transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              {viewMode === "month" && (
                <motion.span
                  layoutId="cal-view-pill"
                  className="absolute inset-0 rounded-pill bg-brand-500 shadow-clay"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <CalendarDays
                size={14}
                className={`relative z-10 ${
                  viewMode === "month" ? "text-white" : ""
                }`}
              />
              <span
                className={`relative z-10 ${
                  viewMode === "month" ? "text-white" : ""
                }`}
              >
                {t("monthView")}
              </span>
            </button>
            <button
              type="button"
              aria-pressed={viewMode === "week"}
              onClick={() => setViewMode("week")}
              className="relative flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-semibold text-text-muted transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              {viewMode === "week" && (
                <motion.span
                  layoutId="cal-view-pill"
                  className="absolute inset-0 rounded-pill bg-brand-500 shadow-clay"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span
                aria-hidden
                className={`relative z-10 text-sm font-semibold ${
                  viewMode === "week" ? "text-white" : ""
                }`}
              >
                7
              </span>
              <span
                className={`relative z-10 ${
                  viewMode === "week" ? "text-white" : ""
                }`}
              >
                {t("weekView")}
              </span>
            </button>
          </div>

          <ExportMenu subscriptions={subscriptions} categories={categories} />
        </div>
      </div>

      {/* Calendar card */}
      <div className="rounded-card bg-surface p-3 shadow-md sm:p-4">
        <AnimatePresence mode="wait" initial={false}>
          {viewMode === "month" ? (
            <motion.div
              key={`month-${format(viewMonth, "yyyy-MM")}`}
              initial={{
                opacity: 0,
                x: navDirection === "next" ? 16 : -16,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                x: navDirection === "next" ? -16 : 16,
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <CalendarMonthView
                subscriptions={subscriptions}
                categories={categories}
                viewMonth={viewMonth}
                selectedDate={selectedDate ?? today}
                today={today}
                onDayClick={handleDayClick}
                keyPrefix={format(viewMonth, "yyyy-MM")}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`week-${format(viewWeek, "yyyy-MM-dd")}`}
              initial={{
                opacity: 0,
                x: navDirection === "next" ? 16 : -16,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                x: navDirection === "next" ? -16 : 16,
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <CalendarWeekView
                subscriptions={subscriptions}
                categories={categories}
                viewWeek={viewWeek}
                selectedDate={selectedDate ?? today}
                today={today}
                onDayClick={handleDayClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category legend — collapsible, bottom-right */}
      <div className="mt-4 flex justify-end">
        <div className="inline-flex flex-col items-end">
          <button
            type="button"
            onClick={() => setLegendOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-pill bg-clay-100 px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:bg-clay-200 hover:text-text"
          >
            {t("legend")}
            <ChevronDown
              size={12}
              className={`transition-transform ${legendOpen ? "rotate-180" : ""}`}
            />
          </button>
          {legendOpen && (
            <div className="mt-2 flex flex-wrap justify-end gap-2 rounded-2xl bg-surface px-4 py-3 shadow-sm ring-1 ring-clay-100">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 text-xs text-text-muted"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cat.color ?? "#8C8884" }}
                    aria-hidden
                  />
                  {cat.name}
                </span>
              ))}
              <span className="mx-1 text-text-subtle" aria-hidden>
                |
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                <span
                  aria-hidden
                  className="rounded-pill border border-dashed border-warning/60 bg-warning/5 px-1.5 py-0.5 text-[9px] font-semibold text-warning"
                >
                  Trial
                </span>
                {t("legendTrial")}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full bg-brand-500/20 ring-1 ring-brand-500/30"
                />
                {t("legendRenewal")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Popover — shows for all clicked dates, even empty ones */}
      <AnimatePresence>
        {selectedDate && (
          <DateDetailPopover
            date={selectedDate}
            events={selectedDayEvents}
            categories={categories}
            anchorRect={popoverAnchor}
            onClose={closePopover}
            onAddSubscription={handleAddWithDate}
          />
        )}
      </AnimatePresence>

      {/* Add subscription modal (triggered from popover "Tambah Langganan") */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-20">
          <button
            type="button"
            aria-label={tf("cancel")}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setShowAddModal(false)}
          />
          <div className="glass-panel-lg relative z-10 w-full max-w-lg rounded-card p-6 shadow-lg">
            <h2 className="font-display text-lg font-bold text-text">
              {tf("titleAdd")}
            </h2>
            <div className="mt-5">
              <SubscriptionForm
                mode="add"
                defaultValues={{ start_date: prefillDate }}
                categories={categories.map((c) => ({
                  id: c.id,
                  name: c.name,
                }))}
                onSubmit={handleAdd}
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
