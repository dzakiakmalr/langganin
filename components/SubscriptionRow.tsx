import { ChevronRight } from "lucide-react";
import { differenceInDays, startOfDay } from "date-fns";
import { useTranslations } from "next-intl";

import type { Subscription } from "@/types/subscription";
import BrandLogo from "@/components/BrandLogo";
import { formatIdr } from "@/lib/utils/format-currency";
import { getRelevantDate } from "@/lib/utils/subscription-dates";
import { Link } from "@/i18n/navigation";

type SubscriptionRowProps = {
  subscription: Subscription;
  categoryName?: string;
  categoryColor?: string | null;
  /** Brand color for the logo block + accent. Falls back to categoryColor, then neutral. */
  brandColor?: string;
};

function daysColor(days: number): string {
  if (days <= 0) return "text-danger";
  if (days <= 3) return "text-danger";
  if (days <= 7) return "text-warning";
  return "text-success";
}

function daysLabel(days: number): string {
  if (days <= 0) return "hari ini";
  if (days === 1) return "besok";
  return `${days} hari lagi`;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const CYCLE_SUB: Record<string, string> = {
  weekly: "/mg",
  monthly: "",
  yearly: "/thn",
  custom_days: "",
};

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
}: SubscriptionRowProps) {
  const t = useTranslations("Subscriptions");
  const today = startOfDay(new Date());
  const daysUntil = differenceInDays(getRelevantDate(subscription), today);
  const isActive = subscription.status === "active" || subscription.status === "trial";
  const cycleSub = CYCLE_SUB[subscription.billing_cycle] ?? "";
  const statusLabel =
    t(STATUS_LABEL_KEY[subscription.status] as "rowStatusActive" | "rowStatusTrial" | "rowStatusPaused" | "rowStatusCancelled") ??
    subscription.status;

  const color = brandColor ?? categoryColor ?? "#8C8884";
  const hoverTint = hexToRgba(color, 0.06);

  return (
    <Link
      href={`/dashboard/subscriptions/${subscription.id}`}
      className="group flex items-center gap-3 rounded-[14px] bg-surface pl-3 pr-4 py-2.5 shadow-sm transition-colors hover:bg-[var(--row-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      style={{ "--row-hover": hoverTint } as React.CSSProperties}
    >
      {/* Brand logo block — replaces the old thin category color bar */}
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
          {subscription.status === "trial" && (
            <span className="rounded-pill bg-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning">
              Trial
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-text-muted">
          {categoryName && <span className="truncate">{categoryName}</span>}
          {isActive && categoryName && <span aria-hidden>·</span>}
          {isActive && (
            <span>
              {subscription.status === "trial" ? "Trial berakhir " : "Perpanjangan "}
              <span className={`font-semibold ${daysColor(daysUntil)}`}>
                {daysLabel(daysUntil)}
              </span>
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

      {/* Chevron */}
      <ChevronRight
        size={16}
        className="shrink-0 text-text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-text-muted"
        aria-hidden
      />
    </Link>
  );
}
