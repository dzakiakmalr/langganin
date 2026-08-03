"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Bell,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  TrendingUp,
} from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { useSidebar } from "@/components/sidebar-context";
import { useSubscriptions } from "@/components/SubscriptionsProvider";

const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "dashboard", Icon: LayoutDashboard },
  {
    href: "/dashboard/subscriptions",
    labelKey: "subscriptions",
    Icon: ListChecks,
  },
  {
    href: "/dashboard/notifications",
    labelKey: "notifications",
    Icon: Bell,
  },
  {
    href: "/dashboard/calendar",
    labelKey: "calendar",
    Icon: CalendarDays,
  },
  {
    href: "/dashboard/analytics",
    labelKey: "analytics",
    Icon: TrendingUp,
  },
  {
    href: "/dashboard/settings",
    labelKey: "settings",
    Icon: Settings,
  },
] as const;

export default function Sidebar() {
  const t = useTranslations("Nav");
  const tn = useTranslations("Notifications");
  const pathname = usePathname();
  const { mobileOpen, closeMobile } = useSidebar();
  const [collapsed, setCollapsed] = useState(false);
  const { unreadCount } = useSubscriptions();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {mobileOpen && (
        <div
          aria-hidden
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`${
          mobileOpen ? "flex" : "hidden"
        } fixed inset-y-0 left-0 z-30 flex-col transition-[width] duration-200 lg:sticky lg:z-20 lg:flex lg:h-screen lg:shrink-0 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Brand-glow blob behind the glass — the signature */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/3 -left-1/4 h-3/4 w-3/4 bg-brand-glow"
          style={{ filter: "blur(60px)" }}
        />

        <div className="glass-panel flex flex-1 flex-col rounded-none border-l-0">
          {/* Brand row */}
          {collapsed ? (
            <div className="flex h-16 items-center justify-center px-3">
              <button
                type="button"
                aria-label="Expand sidebar"
                onClick={() => setCollapsed(false)}
                className="flex items-center justify-center"
              >
                <img src="/LN.png" alt="Langganin" className="h-7 w-7" />
              </button>
            </div>
          ) : (
            <div className="flex h-16 items-center gap-2 px-3">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={closeMobile}
              >
                <img src="/LN.png" alt="Langganin" className="h-7 w-7" />
                <img src="/Langganin.png" alt="Langganin" className="h-5" />
              </Link>
              <button
                type="button"
                aria-label="Collapse sidebar"
                onClick={() => setCollapsed(true)}
                className="ml-auto rounded-[14px] p-1.5 text-text-muted transition-colors hover:bg-white/20 hover:text-text"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>
          )}

          <nav className="flex-1 px-2 py-4">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const showBadge = item.labelKey === "notifications" && unreadCount > 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? "bg-clay-100 text-brand-600 font-semibold shadow-pressed"
                          : "text-text hover:bg-white/20 hover:text-text"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? t(item.labelKey) : undefined}
                    >
                      <item.Icon size={18} className="shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="truncate flex-1">
                            {t(item.labelKey)}
                          </span>
                          {showBadge && (
                            <span
                              aria-label={tn("unreadBadge", { count: unreadCount })}
                              className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold tabular-nums text-white"
                            >
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </>
                      )}
                      {collapsed && showBadge && (
                        <span
                          aria-hidden
                          className="absolute right-1 top-1 h-2 w-2 rounded-full bg-brand-500"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {collapsed ? (
            <div className="px-3 py-4">
              <button
                type="button"
                aria-label="Expand sidebar"
                onClick={() => setCollapsed(false)}
                className="mx-auto flex items-center justify-center rounded-[14px] p-1.5 text-text-muted transition-colors hover:bg-white/20 hover:text-text"
              >
                <PanelLeftOpen size={18} />
              </button>
            </div>
          ) : (
            <p className="px-6 py-4 text-xs text-text-muted">{t("tagline")}</p>
          )}
        </div>
      </aside>
    </>
  );
}
