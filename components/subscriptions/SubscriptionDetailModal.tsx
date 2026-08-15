"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { format, parseISO } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { Subscription } from "@/types/subscription";
import BrandLogo from "@/components/ui/BrandLogo";
import CategoryBadge from "@/components/ui/CategoryBadge";
import { formatIdr } from "@/lib/utils/format-currency";

type SubscriptionDetailModalProps = {
  subscription: Subscription;
  categoryName?: string;
  categoryColor?: string | null;
  brandColor?: string;
  onClose: () => void;
};

const BILLING_LABEL_KEY: Record<string, string> = {
  weekly: "billingWeekly",
  monthly: "billingMonthly",
  yearly: "billingYearly",
  custom_days: "billingCustom",
};

const STATUS_LABEL_KEY: Record<string, string> = {
  active: "rowStatusActive",
  trial: "rowStatusTrial",
  paused: "rowStatusPaused",
  cancelled: "rowStatusCancelled",
};

export default function SubscriptionDetailModal({
  subscription,
  categoryName,
  categoryColor,
  brandColor,
  onClose,
}: SubscriptionDetailModalProps) {
  const t = useTranslations("SubscriptionForm");
  const ts = useTranslations("Subscriptions");
  const locale = useLocale();
  const dfLocale = locale === "id" ? idLocale : enUS;

  const color = brandColor ?? categoryColor ?? "#8C8884";

  const fmt = (d?: string | null) =>
    d ? format(parseISO(d), "d MMM yyyy", { locale: dfLocale }) : "—";

  const cycleKey = BILLING_LABEL_KEY[subscription.billing_cycle];
  const cycleLabel = cycleKey ? t(cycleKey as never) : subscription.billing_cycle;
  const cycleText =
    subscription.billing_cycle === "custom_days" &&
    subscription.custom_cycle_days
      ? `${cycleLabel} (${subscription.custom_cycle_days} ${t("unitDays")})`
      : cycleLabel;

  const statusKey = STATUS_LABEL_KEY[subscription.status];
  const statusLabel = statusKey ? ts(statusKey as never) : subscription.status;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const detailRows: { label: string; value: string }[] = [
    ...(categoryName
      ? [{ label: t("category"), value: categoryName }]
      : []),
    { label: t("billingCycle"), value: cycleText },
    { label: t("startDate"), value: fmt(subscription.start_date) },
    ...(subscription.status === "trial" && subscription.trial_end_date
      ? [{ label: t("trialEndDate"), value: fmt(subscription.trial_end_date) }]
      : [
          {
            label: t("nextBillingDate"),
            value: fmt(subscription.next_billing_date),
          },
        ]),
    ...(subscription.payment_method
      ? [
          {
            label: t("paymentMethod"),
            value: subscription.payment_method,
          },
        ]
      : []),
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={subscription.name}
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 bg-black/25 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Floating panel */}
      <div className="glass-panel-lg relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-card p-5 shadow-lg sm:rounded-card sm:p-6">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label={ts("cancel")}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-clay-100 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 pr-8">
          <BrandLogo
            logoSrc={subscription.logo_url}
            color={color}
            name={subscription.name}
            size={48}
            rounded="rounded-[14px]"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg font-bold text-text">
              {subscription.name}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {categoryName && (
                <CategoryBadge name={categoryName} color={categoryColor ?? null} />
              )}
              {subscription.status === "trial" ? (
                <span className="rounded-pill bg-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning">
                  {statusLabel}
                </span>
              ) : (
                <span className="text-xs font-semibold text-text-muted">
                  {statusLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price */}
        <p
          className="mt-4 text-2xl font-bold tabular-nums"
          style={{ color }}
        >
          {formatIdr(subscription.price)}
          {subscription.billing_cycle === "weekly" && (
            <span className="text-xs font-medium text-text-muted">
              {" "}
              {ts("perWeek")}
            </span>
          )}
          {subscription.billing_cycle === "yearly" && (
            <span className="text-xs font-medium text-text-muted">
              {" "}
              {ts("perYear")}
            </span>
          )}
        </p>

        {/* Details */}
        <dl className="mt-4 space-y-2.5 border-t border-clay-100 pt-4">
          {detailRows.map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-4"
            >
              <dt className="shrink-0 text-sm text-text-muted">{row.label}</dt>
              <dd className="min-w-0 text-right text-sm font-medium text-text">
                {row.value}
              </dd>
            </div>
          ))}
          {subscription.notes && (
            <div className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-sm text-text-muted">{t("notes")}</dt>
              <dd className="min-w-0 whitespace-pre-wrap break-words text-right text-sm font-medium text-text">
                {subscription.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>,
    document.body,
  );
}
