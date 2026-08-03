import { differenceInDays, startOfDay } from "date-fns";

import type { Subscription } from "@/types/subscription";
import CategoryBadge from "@/components/CategoryBadge";
import BrandLogo from "@/components/BrandLogo";
import { formatIdr } from "@/lib/utils/format-currency";
import { getRelevantDate } from "@/lib/utils/subscription-dates";
import { Link } from "@/i18n/navigation";

type SubscriptionCardProps = {
  subscription: Subscription;
  categoryName?: string;
  categoryColor?: string | null;
  /** Brand color for the logo block + card tint. Falls back to categoryColor, then to a neutral. */
  brandColor?: string;
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
}: SubscriptionCardProps) {
  const today = startOfDay(new Date());
  const daysUntil = differenceInDays(getRelevantDate(subscription), today);

  const statusLabel: Record<string, string> = {
    active: "Aktif",
    trial: "Trial",
    paused: "Dihentikan",
    cancelled: "Dibatalkan",
  };

  const statusColor: Record<string, string> = {
    active: "text-success",
    trial: "text-warning",
    paused: "text-text-muted",
    cancelled: "text-text-muted",
  };

  const color = brandColor ?? categoryColor ?? "#8C8884";
  const tint = hexToRgba(color, 0.08);

  return (
    <Link
      href={`/dashboard/subscriptions/${subscription.id}`}
      className="block rounded-card bg-surface p-5 shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:shadow-lg hover:-translate-y-[2px]"
      style={{
        background: `linear-gradient(135deg, ${tint} 0%, var(--color-surface) 60%)`,
      }}
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
                  {statusLabel[subscription.status] ?? subscription.status}
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
                  <span className="text-xs text-text-muted"> /mg</span>
                )}
                {subscription.billing_cycle === "yearly" && (
                  <span className="text-xs text-text-muted"> /thn</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {(subscription.status === "active" || subscription.status === "trial") && (
        <p className="mt-3 border-t border-clay-100 pt-3 text-xs text-text-muted">
          {subscription.status === "trial" ? "Trial berakhir " : "Perpanjangan "}
          <span className={`ml-1 font-semibold ${daysColor(daysUntil)}`}>
            {daysUntil <= 0
              ? "hari ini"
              : daysUntil === 1
                ? "besok"
                : `${daysUntil} hari lagi`}
          </span>
        </p>
      )}
    </Link>
  );
}
