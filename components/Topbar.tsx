"use client";

import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Link } from "@/i18n/navigation";
import { useSidebar } from "@/components/sidebar-context";

export default function Topbar() {
  const t = useTranslations("Topbar");
  const { toggleMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-10 glass-topbar flex h-16 shrink-0 items-center justify-between gap-4 px-4 sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={toggleMobile}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-white/20 hover:text-text"
        >
          <Menu size={20} />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/LN.png" alt="Langganin" className="h-7 w-7" />
          <img src="/Langganin.png" alt="Langganin" className="h-5" />
        </Link>
      </div>
      <div className="hidden min-w-0 flex-1 lg:block">
        <div className="w-full max-w-md truncate rounded-pill glass-pill px-4 py-2 text-sm text-text-muted">
          {t("searchPlaceholder")}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <LanguageSwitcher />
        <span className="hidden text-sm text-text-muted sm:block">
          {t("greeting")}
        </span>
        {/* Clay avatar pebble */}
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint font-display text-sm font-bold text-text shadow-card-sm"
        >
          L
        </span>
      </div>
    </header>
  );
}
