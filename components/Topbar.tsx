import { useTranslations } from "next-intl";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Link } from "@/i18n/navigation";

/**
 * Static placeholder top bar. Real glass-panel styling
 * (04-DESIGN-SYSTEM.md §5) and the Cmd+K command palette are later tasks.
 */
export default function Topbar() {
  const t = useTranslations("Topbar");

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-4 sm:px-6">
      {/* Brand only shows on small screens, where the sidebar is hidden */}
      <Link
        href="/dashboard"
        className="font-display text-lg font-bold text-primary lg:hidden"
      >
        Langganin
      </Link>
      <div className="hidden min-w-0 flex-1 lg:block">
        <div className="w-full max-w-md truncate rounded-pill bg-clay-surface px-4 py-2 text-sm text-text-muted">
          {t("searchPlaceholder")}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <LanguageSwitcher />
        <span className="hidden text-sm text-text-muted sm:block">
          {t("greeting")}
        </span>
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-pill bg-primary-tint font-display text-sm font-bold text-text"
        >
          L
        </span>
      </div>
    </header>
  );
}
