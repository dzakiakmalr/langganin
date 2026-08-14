"use client";

import { useTranslations } from "next-intl";
import { BellOff, Check, CheckCheck } from "lucide-react";

import { useNotifications } from "@/components/SubscriptionsProvider";
import { Link } from "@/i18n/navigation";
import type { AppNotification } from "@/types/notifications";

const MAX_VISIBLE = 8;

function dayWord(daysUntil: number, t: ReturnType<typeof useTranslations>): string {
  if (daysUntil === 0) return t("dayH0");
  if (daysUntil === 1) return t("dayH1");
  if (daysUntil === 3) return t("dayH3");
  if (daysUntil === 7) return t("dayH7");
  return t("dayHGeneric", { days: daysUntil });
}

type NotificationDropdownProps = {
  onClose: () => void;
};

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const t = useTranslations("Notifications");
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;
  const visible = notifications.slice(0, MAX_VISIBLE);

  return (
    <div className="glass-panel-solid overflow-hidden rounded-card shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-clay-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm font-bold text-text">
            {t("title")}
          </h3>
          {unread > 0 && (
            <span className="rounded-pill bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-600 tabular-nums">
              {t("unreadBadge", { count: unread })}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead(notifications)}
            className="inline-flex items-center gap-1 rounded-pill px-2 py-1 text-xs font-semibold text-text-muted transition-colors hover:bg-clay-100 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            <CheckCheck size={12} aria-hidden />
            <span>{t("markAllRead")}</span>
          </button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clay-100 text-text-muted">
            <BellOff size={18} aria-hidden />
          </span>
          <p className="mt-3 text-sm font-semibold text-text">
            {t("emptyTitle")}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {t("emptyDescription")}
          </p>
        </div>
      ) : (
        <ul role="list" className="max-h-[420px] divide-y divide-clay-100 overflow-y-auto">
          {visible.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onMarked={() => markAsRead(n.id)}
            />
          ))}
        </ul>
      )}

      {/* Footer link */}
      <div className="border-t border-clay-100 px-4 py-2.5">
        <Link
          href="/dashboard/notifications"
          onClick={onClose}
          className="block rounded-pill px-2 py-1.5 text-center text-xs font-semibold text-brand-500 transition-colors hover:bg-clay-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
        >
          {t("viewAllSettings")}
        </Link>
      </div>
    </div>
  );
}

function NotificationRow({
  notification,
  onMarked,
}: {
  notification: AppNotification;
  onMarked: () => void;
}) {
  const t = useTranslations("Notifications");
  const isRead = notification.read;
  const isTrial = notification.type === "trial_end";
  const daysUntil = notification.daysUntilEvent;

  const title = isTrial
    ? daysUntil === 0
      ? t("trialEndsToday")
      : t("trialEndsIn", { days: dayWord(daysUntil, t) })
    : daysUntil === 0
      ? t("renewsToday")
      : t("renewalIn", { days: dayWord(daysUntil, t) });

  return (
    <li>
      <button
        type="button"
        onClick={onMarked}
        aria-label={`${notification.subscriptionName} — ${title}`}
        className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-clay-100 focus:outline-none focus-visible:bg-clay-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/40 ${
          isRead ? "opacity-65" : ""
        }`}
      >
        {/* Unread dot */}
        <span
          aria-hidden
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
            isRead
              ? "bg-transparent"
              : "bg-brand-500"
          }`}
        />
        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-sm font-semibold text-text">
              {notification.subscriptionName}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-muted">
            {notification.daysBefore > 0
              ? `${t("dayShort")}${notification.daysBefore} · `
              : ""}
            {title}
          </p>
        </div>
        {/* Read indicator / check on hover */}
        <div className="flex shrink-0 items-center gap-2">
          {isRead ? (
            <span aria-hidden className="text-[10px] text-text-subtle">
              <Check size={12} className="inline" />
            </span>
          ) : (
            <span
              aria-hidden
              className="rounded-pill bg-clay-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-text-muted"
            >
              {t("dayShort")}
              {notification.daysBefore}
            </span>
          )}
        </div>
      </button>
    </li>
  );
}
