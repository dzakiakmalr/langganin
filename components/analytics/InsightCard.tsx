"use client";

import type { LucideIcon } from "lucide-react";

import BrandLogo from "@/components/ui/BrandLogo";
import { useRouter } from "@/i18n/navigation";

type InsightLogos = {
  id: string;
  name: string;
  src: string | null;
  color: string;
};

type InsightCardProps = {
  label: string;
  value: string;
  subline?: string;
  Icon: LucideIcon;
  /** Accent hue: brand-orange for the focal card, neutral for the rest. */
  tone?: "brand" | "warning" | "neutral";
  /**
   * Optional brand identity — when provided, the generic icon is replaced
   * with the brand's logo tile and the card gets a subtle brand-colored
   * tint (mirrors the subscriptions page). Used by the "most expensive"
   * insight card.
   */
  logo?: { src: string | null; color: string };
  /**
   * Optional row of brand logos (avatar-stack style). Each tile is
   * clickable → subscription detail, like the subscriptions list rows.
   * Used by the "upcoming renewals" insight card.
   */
  logos?: InsightLogos[];
};

const toneClasses: Record<NonNullable<InsightCardProps["tone"]>, string> = {
  brand: "bg-brand-50 text-brand-600",
  warning: "bg-warning/10 text-warning",
  neutral: "bg-clay-100 text-text-muted",
};

/** Brand color → translucent rgba — same helper as the subscriptions page. */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const MAX_LOGO_ROW = 6;

export default function InsightCard({
  label,
  value,
  subline,
  Icon,
  tone = "neutral",
  logo,
  logos,
}: InsightCardProps) {
  const router = useRouter();
  const brandColor = logo?.color;
  const tint = brandColor ? hexToRgba(brandColor, 0.08) : undefined;
  const hasLogoRow = logos && logos.length > 0;

  return (
    <div
      className="rounded-card bg-surface p-5 shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:shadow-lg hover:-translate-y-[2px]"
      style={
        tint
          ? {
              background: `linear-gradient(135deg, ${tint} 0%, var(--color-surface) 60%)`,
            }
          : undefined
      }
    >
      <div className="flex items-center gap-2">
        {logo ? (
          <BrandLogo
            logoSrc={logo.src}
            color={logo.color}
            name={value}
            size={32}
            rounded="rounded-[10px]"
          />
        ) : (
          <span
            aria-hidden
            className={`flex h-8 w-8 items-center justify-center rounded-pill ${toneClasses[tone]}`}
          >
            <Icon size={16} />
          </span>
        )}
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </p>
      </div>
      <p className="mt-3 truncate font-display text-2xl font-bold text-text">
        {value}
      </p>
      {subline && (
        <p
          className="mt-1 truncate text-sm font-semibold tabular-nums"
          style={brandColor ? { color: brandColor } : undefined}
          title={subline}
        >
          {subline}
        </p>
      )}
      {hasLogoRow && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {logos!.slice(0, MAX_LOGO_ROW).map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() =>
                router.push(`/dashboard/subscriptions/${l.id}`)
              }
              title={l.name}
              className="rounded-[7px] transition-transform duration-150 ease-out hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              <BrandLogo
                logoSrc={l.src}
                color={l.color}
                name={l.name}
                size={26}
                rounded="rounded-[7px]"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
