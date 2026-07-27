import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "dashboard" },
  { href: "/dashboard/subscriptions", labelKey: "subscriptions" },
  { href: "/dashboard/calendar", labelKey: "calendar" },
  { href: "/dashboard/analytics", labelKey: "analytics" },
  { href: "/dashboard/settings", labelKey: "settings" },
] as const;

/**
 * Static placeholder sidebar. Real glass-panel styling
 * (04-DESIGN-SYSTEM.md §5) is a later task.
 * Hidden below `lg` — full mobile navigation is a separate later phase.
 */
export default function Sidebar() {
  const t = useTranslations("Nav");

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-clay-surface lg:flex">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="font-display text-xl font-bold text-primary">
          Langganin
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-card px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-primary-tint hover:text-text"
              >
                {t(item.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="px-6 py-4 text-xs text-text-muted">{t("tagline")}</p>
    </aside>
  );
}
