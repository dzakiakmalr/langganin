"use client";

import { useState } from "react";
import { Bell, Calendar, Mail, MessageCircle, Plus, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  useNotifications,
  useSubscriptions,
} from "@/components/SubscriptionsProvider";
import {
  FIXED_DAYS_BEFORE,
  MAX_DAYS_BEFORE,
  MIN_DAYS_BEFORE,
  type NotificationChannel,
  type SubscriptionOverride,
} from "@/types/notifications";
import { findBrandByName, resolveBrand } from "@/lib/brands/brand-registry";
import BrandLogo from "@/components/BrandLogo";

const CHANNEL_META: Record<
  NotificationChannel,
  { id: string; Icon: typeof Mail; labelKey: "channelWhatsapp" | "channelEmail" | "channelGoogleCalendar"; tone: string }
> = {
  whatsapp: { id: "whatsapp", Icon: MessageCircle, labelKey: "channelWhatsapp", tone: "#25D366" },
  email: { id: "email", Icon: Mail, labelKey: "channelEmail", tone: "#4285F4" },
  google_calendar: { id: "google_calendar", Icon: Calendar, labelKey: "channelGoogleCalendar", tone: "#F47521" },
};

const FIXED_DAY_LABEL_KEYS: Record<number, "dayH0" | "dayH1" | "dayH3" | "dayH7"> = {
  0: "dayH0",
  1: "dayH1",
  3: "dayH3",
  7: "dayH7",
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function NotificationSettingsClient() {
  const t = useTranslations("Notifications");
  const tCommon = useTranslations("Dashboard");
  const { subscriptions, preferences, updateGlobalPreferences, setSubscriptionOverride } =
    useNotifications();
  const { categories } = useSubscriptions();

  // Saved-flash state for the global form
  const [globalFlash, setGlobalFlash] = useState(false);

  function flash() {
    setGlobalFlash(true);
    window.setTimeout(() => setGlobalFlash(false), 1500);
  }

  const activeAndTrial = subscriptions.filter(
    (s) => s.status === "active" || s.status === "trial",
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">
          {t("settingsTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          {t("settingsDesc")}
        </p>
      </header>

      {/* ── Global defaults ──────────────────────────────────────── */}
      <section
        aria-label={t("globalDefaults")}
        className="rounded-card bg-surface p-5 shadow-md sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-text">
              {t("globalDefaults")}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {t("globalDefaultsDesc")}
            </p>
          </div>
          <span
            aria-live="polite"
            className={`flex h-7 items-center gap-1.5 rounded-pill bg-success/10 px-3 text-xs font-bold text-success transition-opacity ${
              globalFlash ? "opacity-100" : "opacity-0"
            }`}
          >
            <Save size={12} aria-hidden />
            {t("saved")}
          </span>
        </div>

        {/* Days before */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-text">
            {t("daysBeforeLabel")}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {t("daysBeforeDesc")}
          </p>
          <div className="mt-3">
            <DaysBeforePicker
              value={preferences.global.daysBefore}
              onChange={(next) => {
                updateGlobalPreferences({ ...preferences.global, daysBefore: next });
                flash();
              }}
            />
          </div>
        </div>

        {/* Channels */}
        <div>
          <p className="text-sm font-semibold text-text">
            {t("channelsLabel")}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {t("channelsDesc")}
          </p>
          <div className="mt-3 space-y-2">
            {(["whatsapp", "email", "google_calendar"] as const).map((c) => {
              const active = preferences.global.channels.includes(c);
              return (
                <ChannelRow
                  key={c}
                  channel={c}
                  active={active}
                  onToggle={() => {
                    const next = active
                      ? preferences.global.channels.filter((x) => x !== c)
                      : [...preferences.global.channels, c];
                    updateGlobalPreferences({ ...preferences.global, channels: next });
                    flash();
                  }}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Per-subscription overrides ──────────────────────────── */}
      <section
        aria-label={t("perSubscription")}
        className="rounded-card bg-surface p-5 shadow-md sm:p-6"
      >
        <div className="mb-5">
          <h2 className="font-display text-lg font-bold text-text">
            {t("perSubscription")}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {t("perSubscriptionDesc")}
          </p>
        </div>

        {activeAndTrial.length === 0 ? (
          <p className="rounded-[14px] bg-clay-100 px-4 py-6 text-center text-sm text-text-muted">
            {tCommon("noSubscriptions")}
          </p>
        ) : (
          <ul role="list" className="space-y-2">
            {activeAndTrial.map((sub) => {
              const override = preferences.perSubscription[sub.id] ?? null;
              const cat = categories.find((c) => c.id === sub.category_id);
              return (
                <PerSubscriptionRow
                  key={sub.id}
                  subId={sub.id}
                  subName={sub.name}
                  subLogoUrl={sub.logo_url}
                  categoryColor={cat?.color ?? null}
                  override={override}
                  global={preferences.global}
                  onChange={(next) => {
                    setSubscriptionOverride(sub.id, next);
                  }}
                />
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function ChannelRow({
  channel,
  active,
  onToggle,
}: {
  channel: NotificationChannel;
  active: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("Notifications");
  const meta = CHANNEL_META[channel];
  const Icon = meta.Icon;
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-[14px] border border-transparent bg-clay-100 px-4 py-3 transition-colors hover:bg-clay-200`}
    >
      <input
        type="checkbox"
        checked={active}
        onChange={onToggle}
        className="h-4 w-4 shrink-0 rounded accent-brand-500"
        aria-label={t(meta.labelKey)}
      />
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: meta.tone }}
      >
        <Icon size={14} />
      </span>
      <span className="flex-1 text-sm font-semibold text-text">
        {t(meta.labelKey)}
      </span>
      <span
        className="rounded-pill bg-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning"
        title={t("comingSoonHint")}
      >
        {t("comingSoon")}
      </span>
    </label>
  );
}

/**
 * Shared H- days chip picker. Renders the fixed suggestion chips
 * (H-7/H-3/H-1/H-0) plus any custom days the user has added, then a
 * "+ Kustom" button that toggles a small inline input for adding new days.
 */
function DaysBeforePicker({
  value,
  onChange,
}: {
  value: number[];
  onChange: (next: number[]) => void;
}) {
  const t = useTranslations("Notifications");
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Custom days = anything in `value` that isn't a fixed option.
  const customDays = value.filter((d) => !(FIXED_DAYS_BEFORE as readonly number[]).includes(d));

  function toggleDay(d: number) {
    if (value.includes(d)) {
      onChange(value.filter((x) => x !== d));
    } else {
      onChange([...value, d]);
    }
  }

  function addCustom() {
    const n = parseInt(inputValue, 10);
    if (Number.isNaN(n)) {
      setError("invalid");
      return;
    }
    if (n < MIN_DAYS_BEFORE || n > MAX_DAYS_BEFORE) {
      setError("outOfRange");
      return;
    }
    if (value.includes(n)) {
      setError("duplicate");
      return;
    }
    onChange([...value, n].sort((a, b) => b - a));
    setInputValue("");
    setError(null);
  }

  function removeCustom(d: number) {
    onChange(value.filter((x) => x !== d));
  }

  // Render order: fixed chips first (in their fixed order), then custom
  // chips (in descending order of value). This keeps the UI predictable.
  const renderOrder: number[] = [
    ...FIXED_DAYS_BEFORE,
    ...customDays.sort((a, b) => b - a),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {renderOrder.map((d) => {
          const active = value.includes(d);
          const isFixed = (FIXED_DAYS_BEFORE as readonly number[]).includes(d);
          return (
            <span
              key={d}
              className={`inline-flex items-center rounded-pill text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-brand-500 text-white shadow-clay"
                  : "bg-clay-100 text-text-muted hover:bg-clay-200 hover:text-text"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleDay(d)}
                aria-pressed={active}
                aria-label={`H-${d}`}
                className="flex items-center gap-1.5 rounded-pill px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
              >
                <span>H-{d}</span>
                {isFixed && (
                  <span className="text-xs opacity-80">
                    {t(FIXED_DAY_LABEL_KEYS[d])}
                  </span>
                )}
              </button>
              {!isFixed && active && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCustom(d);
                  }}
                  aria-label={`${t("removeDay")} H-${d}`}
                  className="-mr-1 ml-1 mr-1 flex h-6 w-6 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <X size={12} aria-hidden />
                </button>
              )}
            </span>
          );
        })}
        <button
          type="button"
          onClick={() => setShowInput((v) => !v)}
          aria-expanded={showInput}
          className="inline-flex items-center gap-1.5 rounded-pill border border-dashed border-clay-200 bg-clay-100 px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-clay-200 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
        >
          <Plus size={14} aria-hidden />
          {t("customDay")}
        </button>
      </div>

      {showInput && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="custom-day-input">
            {t("customDay")}
          </label>
          <input
            id="custom-day-input"
            type="number"
            min={MIN_DAYS_BEFORE}
            max={MAX_DAYS_BEFORE}
            inputMode="numeric"
            placeholder={t("customDayPlaceholder")}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            className="w-20 rounded-pill bg-surface-soft px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <button
            type="button"
            onClick={addCustom}
            className="rounded-pill bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            {t("addCustomDay")}
          </button>
          {error && (
            <span
              role="alert"
              className="text-xs text-danger"
            >
              {error === "outOfRange"
                ? `${t("invalidDayRange")}`
                : error === "duplicate"
                  ? "—"
                  : null}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function PerSubscriptionRow({
  subName,
  subLogoUrl,
  categoryColor,
  override,
  global,
  onChange,
}: {
  subId: string;
  subName: string;
  subLogoUrl: string | null;
  categoryColor: string | null;
  override: SubscriptionOverride | null;
  global: SubscriptionOverride;
  onChange: (next: SubscriptionOverride | null) => void;
}) {
  const t = useTranslations("Notifications");
  const [expanded, setExpanded] = useState(false);
  const isCustom = override !== null;
  // Local draft for the expanded form — initialized from the override or global
  const [draft, setDraft] = useState<SubscriptionOverride>(
    override ?? global,
  );

  // Resolve the brand for the logo + tint. Unknown services get a neutral
  // fallback so the row is still readable.
  const brand = findBrandByName(subName);
  const brandColor = brand?.color ?? categoryColor ?? "#8C8884";
  const tint = hexToRgba(brandColor, 0.07);
  const rowStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${tint} 0%, var(--color-surface) 75%)`,
  };
  const logoResolved = resolveBrand(subName, subLogoUrl);

  function toggleCustom() {
    if (isCustom) {
      // Clear override
      onChange(null);
      setExpanded(false);
    } else {
      // Start customizing with a copy of the global defaults
      const start: SubscriptionOverride = { ...global };
      setDraft(start);
      onChange(start);
      setExpanded(true);
    }
  }

  function setDays(nextDays: number[]) {
    if (!isCustom) return; // safety
    const next = { ...draft, daysBefore: nextDays };
    setDraft(next);
    onChange(next);
  }

  function toggleChannel(c: NotificationChannel) {
    if (!isCustom) return; // safety
    const nextCh = draft.channels.includes(c)
      ? draft.channels.filter((x) => x !== c)
      : [...draft.channels, c];
    const next = { ...draft, channels: nextCh };
    setDraft(next);
    onChange(next);
  }

  return (
    <li
      className="rounded-[14px] shadow-sm"
      style={rowStyle}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <BrandLogo
          logoSrc={logoResolved.logoSrc}
          color={logoResolved.color}
          name={subName}
          size={32}
          rounded="rounded-[8px]"
        />
        <span className="flex-1 truncate text-sm font-semibold text-text">
          {subName}
        </span>
        <button
          type="button"
          onClick={toggleCustom}
          className={`rounded-pill px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
            isCustom
              ? "bg-brand-100 text-brand-600"
              : "bg-clay-100 text-text-muted hover:bg-clay-200 hover:text-text"
          }`}
        >
          {isCustom ? t("customize") : t("useDefault")}
        </button>
        {isCustom && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="rounded-[10px] p-1 text-text-muted transition-colors hover:bg-clay-100 hover:text-text"
            title={expanded ? "Collapse" : "Expand"}
          >
            <Bell size={14} aria-hidden />
          </button>
        )}
      </div>
      {isCustom && expanded && (
        <div className="border-t border-clay-100 px-4 py-3">
          <div className="mb-3">
            <DaysBeforePicker
              value={draft.daysBefore}
              onChange={setDays}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["whatsapp", "email", "google_calendar"] as const).map((c) => {
              const meta = CHANNEL_META[c];
              const active = draft.channels.includes(c);
              const Icon = meta.Icon;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChannel(c)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                    active
                      ? "text-white"
                      : "bg-clay-100 text-text-muted hover:bg-clay-200 hover:text-text"
                  }`}
                  style={
                    active
                      ? { backgroundColor: meta.tone }
                      : undefined
                  }
                  title={t("comingSoonHint")}
                >
                  <Icon size={12} aria-hidden />
                  {t(meta.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </li>
  );
}
