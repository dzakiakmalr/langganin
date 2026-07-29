"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  TrendingUp,
} from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "dashboard", Icon: LayoutDashboard },
  {
    href: "/dashboard/subscriptions",
    labelKey: "subscriptions",
    Icon: ListChecks,
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
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`sticky top-0 z-20 hidden h-screen shrink-0 flex-col transition-[width] duration-200 lg:flex ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-bg-gradient-a to-bg-gradient-b opacity-85"
      />

      <div className="glass-sidebar flex flex-1 flex-col rounded-none border-l-0">
        {/* Brand + collapse toggle */}
        <div className="flex h-16 items-center gap-2 px-3">
          <Link
            href="/"
            className={`flex items-center gap-2 ${collapsed ? "mx-auto" : ""}`}
          >
            <img src="/LN.png" alt="Langganin" className="h-7 w-7" />
            {!collapsed && (
              <img src="/Langganin.png" alt="Langganin" className="h-5" />
            )}
          </Link>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((v) => !v)}
            className={`rounded-[14px] p-1.5 text-text-muted transition-colors hover:bg-white/20 hover:text-text ${
              collapsed ? "" : "ml-auto"
            }`}
          >
            <CollapseIcon size={18} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-clay-surface/80 text-primary font-semibold shadow-pressed"
                      : "text-text hover:bg-white/20 hover:text-text"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? t(item.labelKey) : undefined}
                >
                  <item.Icon size={18} className="shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{t(item.labelKey)}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {!collapsed && (
          <p className="px-6 py-4 text-xs text-text-muted">{t("tagline")}</p>
        )}
      </div>
    </aside>
  );
}
