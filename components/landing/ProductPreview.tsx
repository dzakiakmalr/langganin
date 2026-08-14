import {
  Bell,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  Settings,
  TrendingUp,
} from "lucide-react";

import BrandLogo from "@/components/ui/BrandLogo";
import { buildLogoUrl } from "@/lib/brands/brand-registry";

/**
 * Static "screenshot" of the dashboard — decorative, no state, no data.
 * Uses the real design tokens + real Logo.dev logos so the landing page
 * shows the actual product look without pulling in providers.
 */

const NAV_ITEMS = [
  { Icon: LayoutDashboard, active: true },
  { Icon: ListChecks, active: false },
  { Icon: Bell, active: false },
  { Icon: CalendarDays, active: false },
  { Icon: TrendingUp, active: false },
  { Icon: Settings, active: false },
] as const;

const PREVIEW_SUBS = [
  { name: "Netflix", color: "#E50914", logoSrc: buildLogoUrl("Netflix"), price: "Rp 153.000", cycle: "/bln", status: "active" },
  { name: "Spotify", color: "#1DB954", logoSrc: buildLogoUrl("Spotify"), price: "Rp 54.990", cycle: "/bln", status: "active" },
  { name: "Vidio", color: "#E63946", logoSrc: buildLogoUrl("Vidio"), price: "Rp 399.000", cycle: "/thn", status: "trial" },
] as const;

const PREVIEW_ACTIVE = [
  { name: "Netflix", color: "#E50914", logoSrc: buildLogoUrl("Netflix") },
  { name: "Spotify", color: "#1DB954", logoSrc: buildLogoUrl("Spotify") },
  { name: "ChatGPT", color: "#10A37F", logoSrc: buildLogoUrl("ChatGPT") },
  { name: "Canva", color: "#00C4CC", logoSrc: buildLogoUrl("Canva") },
];

export default function ProductPreview({ locale }: { locale: string }) {
  const id = locale === "id";

  const l = {
    hello: id ? "Halo, Raka" : "Hi, Raka",
    perMonth: id ? "/bulan" : "/mo",
    monthly: id ? "Total bulan ini" : "Monthly total",
    yearly: id ? "Proyeksi tahunan" : "Projected yearly",
    active: id ? "Langganan aktif" : "Active subscriptions",
    activeLabel: id ? "Aktif" : "Active",
    trialLabel: id ? "Trial" : "Trial",
  };

  return (
    <div className="overflow-hidden rounded-card border border-white/70 bg-white/75 shadow-clay backdrop-blur-xl transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-clay-hover">
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-white/50 bg-white/60 px-5 py-3">
        <div className="flex items-center gap-1.5">
          <span aria-hidden className="h-3 w-3 rounded-full" style={{ backgroundColor: "#FF5F57" }} />
          <span aria-hidden className="h-3 w-3 rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
          <span aria-hidden className="h-3 w-3 rounded-full" style={{ backgroundColor: "#28C840" }} />
        </div>
        <span className="flex-1 truncate text-center text-xs font-medium text-text-muted">
          Langganin — {id ? "Dasbor" : "Dashboard"}
        </span>
        <span className="w-12" aria-hidden />
      </div>

      <div className="flex">
        {/* Mini sidebar */}
        <div className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-white/50 py-3 sm:flex">
          {NAV_ITEMS.map((item, i) => (
            <span
              key={i}
              className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${
                item.active ? "bg-brand-500 text-white shadow-clay" : "text-text-muted"
              }`}
            >
              <item.Icon size={16} aria-hidden />
            </span>
          ))}
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-3 p-4">
          {/* Greeting + total */}
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-text">{l.hello}</p>
            <p className="shrink-0 text-sm font-bold tabular-nums text-text">
              Rp 696.000 <span className="font-medium text-text-muted">{l.perMonth}</span>
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[14px] bg-surface p-2.5 shadow-sm">
              <p className="text-[10px] text-text-muted">{l.monthly}</p>
              <p className="mt-1 truncate text-sm font-bold tabular-nums text-text">Rp 696.000</p>
            </div>
            <div className="rounded-[14px] bg-surface p-2.5 shadow-sm">
              <p className="text-[10px] text-text-muted">{l.yearly}</p>
              <p className="mt-1 truncate text-sm font-bold tabular-nums text-text">Rp 8,3 jt</p>
            </div>
            <div className="rounded-[14px] bg-surface p-2.5 shadow-sm">
              <p className="text-[10px] text-text-muted">{l.active}</p>
              <div className="mt-1 flex items-center">
                <div className="flex -space-x-1.5">
                  {PREVIEW_ACTIVE.map((s) => (
                    <BrandLogo
                      key={s.name}
                      logoSrc={s.logoSrc}
                      color={s.color}
                      name={s.name}
                      size={18}
                      rounded="rounded-full"
                      className="ring-2 ring-surface"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription cards */}
          <div className="space-y-2">
            {PREVIEW_SUBS.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-2.5 rounded-[14px] bg-surface px-3 py-2 shadow-sm"
              >
                <BrandLogo
                  logoSrc={s.logoSrc}
                  color={s.color}
                  name={s.name}
                  size={28}
                  rounded="rounded-[8px]"
                />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-text">
                  {s.name}
                </span>
                <span
                  className={`shrink-0 rounded-pill px-2 py-0.5 text-[9px] font-bold ${
                    s.status === "trial"
                      ? "bg-warning/10 text-warning"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {s.status === "trial" ? l.trialLabel : l.activeLabel}
                </span>
                <span className="shrink-0 text-xs font-bold tabular-nums text-text">
                  {s.price}
                  <span className="font-medium text-text-muted">{s.cycle}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
