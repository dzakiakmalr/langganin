"use client";

import { useState } from "react";
import { differenceInDays, startOfDay } from "date-fns";
import { Check, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Subscription } from "@/types/subscription";
import CategoryBadge from "@/components/CategoryBadge";
import BrandLogo from "@/components/BrandLogo";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatIdr } from "@/lib/utils/format-currency";
import { getRelevantDate } from "@/lib/utils/subscription-dates";
import { Link, useRouter } from "@/i18n/navigation";
import { useSubscriptions } from "@/components/SubscriptionsProvider";

type SubscriptionCardProps = {
  subscription: Subscription;
  categoryName?: string;
  categoryColor?: string | null;
  /** Brand color for the logo block + card tint. Falls back to categoryColor, then to a neutral. */
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

export default function SubscriptionCard({
  subscription,
  categoryName,
  categoryColor,
  brandColor,
  selectable = false,
  selected = false,
  onToggleSelect,
}: SubscriptionCardProps) {
  const t = useTranslations("Subscriptions");
  const td = useTranslations("SubscriptionDetail");
  const router = useRouter();
  const { deleteSubscription } = useSubscriptions();
  const [showDelete, setShowDelete] = useState(false);

  const today = startOfDay(new Date());
  const daysUntil = differenceInDays(getRelevantDate(subscription), today);

  const statusLabelKey: Record<
    string,
    "rowStatusActive" | "rowStatusTrial" | "rowStatusPaused" | "rowStatusCancelled"
  > = {
    active: "rowStatusActive",
    trial: "rowStatusTrial",
    paused: "rowStatusPaused",
    cancelled: "rowStatusCancelled",
  };

  const statusLabel = statusLabelKey[subscription.status]
    ? t(statusLabelKey[subscription.status])
    : subscription.status;

  const statusColor: Record<string, string> = {
    active: "text-success",
    trial: "text-warning",
    paused: "text-text-muted",
    cancelled: "text-text-muted",
  };

  const color = brandColor ?? categoryColor ?? "#8C8884";
  const tint = hexToRgba(color, 0.08);

  const editUrl = `/dashboard/subscriptions/${subscription.id}`;

  const handleDelete = () => {
    deleteSubscription(subscription.id);
    setShowDelete(false);
  };

  return (
    <div
      className="relative rounded-card bg-surface p-5 shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:shadow-lg hover:-translate-y-[2px]"
      style={{
        background: `linear-gradient(135deg, ${tint} 0%, var(--color-surface) 60%)`,
      }}
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
          className={`absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-surface shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
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
        className="block"
      >
        <div className="flex items-start gap-3">
          <BrandLogo
            logoSrc={subscription.logo_url}
            color={color}
            name={subscription.name}
            size={44}
            rounded="rounded-[12px]"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-display text-base font-bold text-text">
                  {subscription.name}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {categoryName && (
                    <CategoryBadge name={categoryName} color={categoryColor ?? null} />
                  )}
                  <span className={`text-xs font-semibold ${statusColor[subscription.status]}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className="text-base font-bold tabular-nums"
                  style={{ color }}
                >
                  {formatIdr(subscription.price)}
                  {subscription.billing_cycle === "weekly" && (
                    <span className="text-xs text-text-muted">{t("perWeek")}</span>
                  )}
                  {subscription.billing_cycle === "yearly" && (
                    <span className="text-xs text-text-muted">{t("perYear")}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {(subscription.status === "active" || subscription.status === "trial") && (
          <p className="mt-3 border-t border-clay-100 pt-3 text-xs text-text-muted">
            {subscription.status === "trial" ? t("trialEndsLabel") : t("renewsLabel")}{" "}
            <span className={`ml-1 font-semibold ${daysColor(daysUntil)}`}>
              {daysUntil <= 0
                ? t("inToday")
                : daysUntil === 1
                  ? t("inTomorrow")
                  : t("inDays", { count: daysUntil })}
            </span>
          </p>
        )}
      </Link>

      {/* Action row */}
      {!selectable && (
        <div className="mt-3 flex items-center gap-2 border-t border-clay-100 pt-3">
          <button
            type="button"
            onClick={() => router.push(editUrl)}
            className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:bg-clay-100 hover:text-text"
          >
            <Pencil size={14} />
            {t("editButton")}
          </button>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/10"
          >
            <Trash2 size={14} />
            {t("deleteButton")}
          </button>
        </div>
      )}

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
