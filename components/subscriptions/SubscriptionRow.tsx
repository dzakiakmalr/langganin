"use client";

import { useState } from "react";
import { Check, Pause, Pencil, Play, RotateCcw, Trash2 } from "lucide-react";
import { differenceInDays, startOfDay } from "date-fns";
import { useTranslations } from "next-intl";

import { DELETED_RETENTION_DAYS, type Subscription } from "@/types/subscription";
import BrandLogo from "@/components/ui/BrandLogo";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatIdr } from "@/lib/utils/format-currency";
import { getRelevantDate } from "@/lib/utils/subscription-dates";
import { Link, useRouter } from "@/i18n/navigation";
import { useSubscriptions } from "@/components/subscriptions/SubscriptionsProvider";

type SubscriptionRowProps = {
  subscription: Subscription;
  categoryName?: string;
  categoryColor?: string | null;
  /** Brand color for the logo block + accent. Falls back to categoryColor, then neutral. */
  brandColor?: string;
  /** Bulk-select mode: show a checkbox and toggle selection instead of navigating. */
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
};

function daysColor(days: number): string {
  if (days <= 0) return "text-danger";
  if (days <= 3) return "text-danger";
  if (days <= 7) return "text-warning";
  return "text-success";
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const STATUS_COLOR: Record<string, string> = {
  active: "text-success",
  trial: "text-warning",
  paused: "text-text-muted",
  cancelled: "text-text-muted",
};

const STATUS_LABEL_KEY: Record<string, string> = {
  active: "rowStatusActive",
  trial: "rowStatusTrial",
  paused: "rowStatusPaused",
  cancelled: "rowStatusCancelled",
};

export default function SubscriptionRow({
  subscription,
  categoryName,
  categoryColor,
  brandColor,
  selectable = false,
  selected = false,
  onToggleSelect,
}: SubscriptionRowProps) {
  const t = useTranslations("Subscriptions");
  const td = useTranslations("SubscriptionDetail");
  const router = useRouter();
  const { deleteSubscription, restoreSubscription, updateSubscription } =
    useSubscriptions();
  const [showDelete, setShowDelete] = useState(false);

  const today = startOfDay(new Date());
  const daysUntil = differenceInDays(getRelevantDate(subscription), today);
  const isActive = subscription.status === "active" || subscription.status === "trial";
  const isPaused = subscription.status === "paused";
  const isDeleted = subscription.status === "cancelled";
  const daysSinceDeleted = subscription.deleted_at
    ? differenceInDays(today, startOfDay(new Date(subscription.deleted_at)))
    : 0;
  const deleteDaysLeft = Math.max(
    0,
    DELETED_RETENTION_DAYS - daysSinceDeleted,
  );
  const cycleSub =
    subscription.billing_cycle === "weekly"
      ? t("perWeek")
      : subscription.billing_cycle === "yearly"
        ? t("perYear")
        : "";
  const statusLabel =
    t(STATUS_LABEL_KEY[subscription.status] as "rowStatusActive" | "rowStatusTrial" | "rowStatusPaused" | "rowStatusCancelled") ??
    subscription.status;

  const daysLabel = (days: number): string =>
    days <= 0
      ? t("inToday")
      : days === 1
        ? t("inTomorrow")
        : t("inDays", { count: days });

  const color = brandColor ?? categoryColor ?? "#8C8884";
  const hoverTint = hexToRgba(color, 0.06);
  const editUrl = `/dashboard/subscriptions/${subscription.id}`;

  const handleDelete = () => {
    deleteSubscription(subscription.id);
    setShowDelete(false);
  };

  const handleTogglePause = () => {
    updateSubscription(subscription.id, {
      status: isPaused
        ? subscription.is_trial
          ? "trial"
          : "active"
        : "paused",
    });
  };

  const handleRestore = () => {
    restoreSubscription(subscription.id);
  };

  return (
    <div
      className={`flex items-center gap-1 rounded-[14px] bg-surface py-2.5 pl-3 pr-2 shadow-sm transition-[background-color,opacity,filter] hover:bg-[var(--row-hover)] ${
        isPaused || isDeleted ? "opacity-60 grayscale" : ""
      }`}
      style={{ "--row-hover": hoverTint } as React.CSSProperties}
    >
      {/* Selection checkbox (bulk-select mode) */}
      {selectable && (
        <button
          type="button"
          aria-label={selected ? t("bulkClear") : t("bulkSelect")}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelect?.();
          }}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-surface shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
            selected ? "border-transparent" : "border-clay-200"
          }`}
          style={selected ? { backgroundColor: color } : undefined}
        >
          {selected && <Check size={12} className="text-white" aria-hidden />}
        </button>
      )}

      <Link
        href={editUrl}
        onClick={(e) => {
          if (selectable) {
            e.preventDefault();
            onToggleSelect?.();
          }
        }}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-[8px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      >
        {/* Brand logo block */}
        <BrandLogo
          logoSrc={subscription.logo_url}
          color={color}
          name={subscription.name}
          size={32}
          rounded="rounded-[8px]"
        />

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate text-sm font-semibold text-text">
              {subscription.name}
            </span>
            <span
              className={`text-xs font-semibold ${STATUS_COLOR[subscription.status] ?? "text-text-muted"}`}
            >
              {statusLabel}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-text-muted">
            {categoryName && <span className="truncate">{categoryName}</span>}
            {(isActive || isDeleted) && categoryName && <span aria-hidden>·</span>}
            {isActive && (
              <span>
                {subscription.status === "trial" ? t("trialEndsLabel") : t("renewsLabel")}{" "}
                <span className={`font-semibold ${daysColor(daysUntil)}`}>
                  {daysLabel(daysUntil)}
                </span>
              </span>
            )}
            {isDeleted && (
              <span className="font-semibold">
                {t("deletedHint", { days: deleteDaysLeft })}
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="shrink-0 text-right">
          <div
            className="text-sm font-bold tabular-nums"
            style={{ color }}
          >
            {formatIdr(subscription.price)}
            {cycleSub && <span className="text-xs text-text-muted"> {cycleSub}</span>}
          </div>
        </div>
      </Link>

      {/* Actions */}
      {!selectable && isDeleted ? (
        <button
          type="button"
          aria-label={t("restoreButton")}
          onClick={handleRestore}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-brand-600 transition-colors hover:bg-brand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
        >
          <RotateCcw size={15} aria-hidden />
        </button>
      ) : !selectable ? (
        <>
          <button
            type="button"
            aria-label={t("editButton")}
            onClick={() => router.push(editUrl)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-text-muted transition-colors hover:bg-clay-100 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            <Pencil size={15} aria-hidden />
          </button>
          <button
            type="button"
            aria-label={isPaused ? t("resumeButton") : t("pauseButton")}
            onClick={handleTogglePause}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-text-muted transition-colors hover:bg-clay-100 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            {isPaused ? <Play size={15} aria-hidden /> : <Pause size={15} aria-hidden />}
          </button>
          <button
            type="button"
            aria-label={t("deleteButton")}
            onClick={() => setShowDelete(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-text-muted transition-colors hover:bg-danger/10 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            <Trash2 size={15} aria-hidden />
          </button>
        </>
      ) : null}

      <ConfirmDialog
        open={showDelete}
        title={td("deleteTitle")}
        body={td("deleteBody")}
        confirmLabel={td("deleteButton")}
        cancelLabel={td("deleteCancel")}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
