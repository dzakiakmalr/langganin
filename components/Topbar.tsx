"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Menu, Search } from "lucide-react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import NotificationBell from "@/components/NotificationBell";
import BrandLogo from "@/components/BrandLogo";
import { useSubscriptions } from "@/components/SubscriptionsProvider";
import { findBrandByName } from "@/lib/brands/brand-registry";
import { formatIdr } from "@/lib/utils/format-currency";
import { Link, useRouter } from "@/i18n/navigation";
import { useSidebar } from "@/components/sidebar-context";

export default function Topbar() {
  const t = useTranslations("Topbar");
  const ts = useTranslations("Subscriptions");
  const { toggleMobile } = useSidebar();
  const router = useRouter();
  const { subscriptions, profileName } = useSubscriptions();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const displayName = profileName.trim();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return subscriptions
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 7);
  }, [subscriptions, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    router.push(
      q
        ? `/dashboard/subscriptions?q=${encodeURIComponent(q)}`
        : "/dashboard/subscriptions",
    );
  };

  const goToSub = (id: string) => {
    setOpen(false);
    router.push(`/dashboard/subscriptions/${id}`);
  };

  return (
    <header className="sticky top-0 z-30 glass-panel-strong flex h-16 shrink-0 items-center justify-between gap-4 px-4 sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={toggleMobile}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-white/40 hover:text-text"
        >
          <Menu size={20} />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/LN.png" alt="Langganin" className="h-7 w-7" />
          <img src="/Langganin.png" alt="Langganin" className="h-5" />
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        role="search"
        className="relative hidden min-w-0 flex-1 lg:block"
      >
        <div className="relative w-full max-w-md">
          <Search
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="w-full rounded-pill glass-panel py-2 pl-10 pr-12 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <button
            type="submit"
            aria-label={t("searchPlaceholder")}
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-brand-500 text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[calc(50%+1px)] hover:shadow-clay-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            <Search size={14} aria-hidden />
          </button>
        </div>

        {/* Live results */}
        {open && query.trim() && (
          <div className="glass-panel absolute left-0 top-full z-30 mt-2 w-full max-w-md overflow-hidden rounded-card shadow-lg">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-text-muted">{ts("noResults")}</p>
            ) : (
              <ul className="max-h-72 overflow-y-auto p-1.5">
                {results.map((sub) => {
                  const color = findBrandByName(sub.name)?.color ?? "#8C8884";
                  return (
                    <li key={sub.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          goToSub(sub.id);
                        }}
                        className="flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left transition-colors hover:bg-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                      >
                        <BrandLogo
                          logoSrc={sub.logo_url}
                          color={color}
                          name={sub.name}
                          size={28}
                          rounded="rounded-[8px]"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-text">
                            {sub.name}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs font-bold tabular-nums text-text-muted">
                          {formatIdr(sub.price)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex items-center gap-1.5 border-t border-white/20 px-4 py-2 text-xs text-text-muted">
              <span>{t("searchHint")}</span>
              <ArrowRight size={12} aria-hidden />
            </div>
          </div>
        )}
      </form>

      <div className="flex shrink-0 items-center gap-3">
        <NotificationBell />
        <LanguageSwitcher />
        <span className="hidden text-sm text-text-muted sm:block">
          {displayName ? t("greetingName", { name: displayName }) : t("greeting")}
        </span>
        {/* Clay avatar pebble */}
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-display text-sm font-bold text-text shadow-clay"
        >
          {(displayName.charAt(0) || "L").toUpperCase()}
        </span>
      </div>
    </header>
  );
}
