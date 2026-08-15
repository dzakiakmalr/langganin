import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Bell,
  Calendar,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import BrandLogo from "@/components/ui/BrandLogo";
import LandingNav from "@/components/landing/LandingNav";
import ProductPreview from "@/components/landing/ProductPreview";
import Reveal from "@/components/landing/Reveal";
import { buildLogoUrl } from "@/lib/brands/brand-registry";
import { Link } from "@/i18n/navigation";

const FEATURES = [
  { Icon: ListChecks, titleKey: "feature1Title", descKey: "feature1Desc" },
  { Icon: Bell, titleKey: "feature2Title", descKey: "feature2Desc" },
  { Icon: LayoutDashboard, titleKey: "feature3Title", descKey: "feature3Desc" },
  { Icon: CalendarDays, titleKey: "feature4Title", descKey: "feature4Desc" },
  { Icon: Sparkles, titleKey: "feature5Title", descKey: "feature5Desc" },
  { Icon: ShieldCheck, titleKey: "feature6Title", descKey: "feature6Desc" },
] as const;

const PAYMENT_METHODS = [
  { label: "GoPay", color: "#00A79D", initial: "G" },
  { label: "OVO", color: "#4A2691", initial: "O" },
  { label: "DANA", color: "#0A6EBD", initial: "D" },
  { label: "ShopeePay", color: "#EE4D2D", initial: "S" },
  { label: "QRIS", color: "#D32F2F", initial: "Q" },
  { label: "Transfer Bank", color: "#5C5A57", initial: "B" },
] as const;

const SOCIAL_BRANDS = [
  { name: "Netflix", color: "#E50914" },
  { name: "Spotify", color: "#1DB954" },
  { name: "YouTube", color: "#FF0000" },
  { name: "ChatGPT", color: "#10A37F" },
  { name: "Disney+", color: "#113CCF" },
  { name: "Canva", color: "#00C4CC" },
] as const;

const REMIND_CHANNELS = [
  { Icon: Mail, labelKey: "channelEmail" },
  { Icon: MessageCircle, labelKey: "channelWhatsapp" },
  { Icon: Calendar, labelKey: "channelGoogleCalendar" },
] as const;

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <>
      <LandingNav locale={locale} />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        {/* Big terracotta blob behind the mockup (right) */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-12%] top-[10%] h-[64vh] w-[64vh] rounded-full opacity-50 blur-[90px]"
          style={{ background: "radial-gradient(circle, rgba(226,107,67,0.45) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/4 -left-1/4 h-[60vh] w-[60vh] rounded-full opacity-40 blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(226,107,67,0.25) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-text sm:text-5xl sm:leading-tight">
              {t("heroHeadline")}{" "}
              <span className="text-brand-500">{t("heroHeadlineAccent")}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg lg:mx-0">
              {t("heroSubheadline")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href="/register"
                className="rounded-pill bg-brand-500 px-7 py-3 text-sm font-bold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover"
              >
                {t("heroCTA")}
              </Link>
              <Link
                href="/dashboard"
                className="rounded-pill px-7 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-clay-100 hover:text-text"
              >
                {t("heroDemo")}
              </Link>
            </div>
          </div>

          <ProductPreview locale={locale} />
        </div>
      </section>

      {/* ── Social proof strip ───────────────────────────────────── */}
      <section className="relative z-10 px-4 py-6 sm:px-6">
        <Reveal>
          <div className="glass-panel mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 rounded-pill px-5 py-2.5 text-center sm:flex-row sm:gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t("socialProofEyebrow")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {SOCIAL_BRANDS.map((b) => (
                <BrandLogo
                  key={b.name}
                  logoSrc={buildLogoUrl(b.name)}
                  color={b.color}
                  name={b.name}
                  size={26}
                  rounded="rounded-full"
                  className="ring-1 ring-white"
                />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Features (bento) ─────────────────────────────────────── */}
      <section className="relative z-10 border-y border-clay-100 bg-bg-elevated px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">
              {t("featureEyebrow")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-text sm:text-4xl">
              {t("heroHeadlineAccent")}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map(({ Icon, titleKey, descKey }, i) => {
              const isFeatured = i === 0;
              const isChannelCard = i === 1;
              const isWide = i === FEATURES.length - 1;
              const spanClass = isFeatured
                ? "sm:col-span-2 xl:col-span-2"
                : isWide
                  ? "sm:col-span-2 xl:col-span-3"
                  : "";
              return (
                <Reveal key={titleKey} delay={i * 0.05} className={spanClass}>
                  <div
                    className={`clay-gradient h-full rounded-card shadow-clay transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-clay-hover ${
                      isFeatured ? "p-7 sm:p-8" : "p-6"
                    }`}
                  >
                    <div className="clay-icon flex h-12 w-12 items-center justify-center rounded-2xl text-brand-600">
                      <Icon size={22} aria-hidden />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-text">
                      {t(titleKey)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                      {t(descKey)}
                    </p>
                    {isFeatured && (
                      <div className="mt-5 flex items-center gap-1">
                        {SOCIAL_BRANDS.slice(0, 5).map((b) => (
                          <BrandLogo
                            key={b.name}
                            logoSrc={buildLogoUrl(b.name)}
                            color={b.color}
                            name={b.name}
                            size={24}
                            rounded="rounded-full"
                            className="ring-2 ring-white"
                          />
                        ))}
                      </div>
                    )}
                    {isChannelCard && (
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        {REMIND_CHANNELS.map((c) => (
                          <span
                            key={c.labelKey}
                            className="inline-flex items-center gap-1.5 rounded-pill bg-white/70 px-3 py-1.5 text-xs font-semibold text-text shadow-sm"
                          >
                            <c.Icon size={12} className="text-brand-600" aria-hidden />
                            {t(c.labelKey)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Built for Indonesia ──────────────────────────────────── */}
      <section className="bg-dots relative z-10 px-4 py-20 sm:px-6">
        <Reveal>
          <div className="glass-panel mx-auto max-w-3xl rounded-card p-8 text-center shadow-md sm:p-12">
            <div className="mb-4 flex items-center justify-center gap-2">
              <svg viewBox="0 0 30 20" className="h-5 w-8 rounded shadow-sm" aria-hidden>
                <rect width="30" height="10" fill="#FF0000" />
                <rect y="10" width="30" height="10" fill="#FFFFFF" />
              </svg>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
                {t("indonesiaSubtitle")}
              </p>
            </div>
            <h2 className="font-display text-3xl font-bold text-text sm:text-4xl">
              {t("indonesiaTitle")}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-muted">
              {t("indonesiaDesc")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {PAYMENT_METHODS.map((p) => (
                <span
                  key={p.label}
                  className="inline-flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-bold text-white shadow-clay"
                  style={{ backgroundColor: p.color }}
                >
                  <span
                    aria-hidden
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold"
                  >
                    {p.initial}
                  </span>
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="relative z-10 px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="glass-panel mx-auto max-w-2xl rounded-card p-10 text-center shadow-md sm:p-14">
            <h2 className="font-display text-2xl font-bold text-text sm:text-3xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-text-muted">
              {t("ctaDesc")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-pill bg-brand-500 px-8 py-3 text-sm font-bold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover"
              >
                {t("ctaButton")}
              </Link>
              <Link
                href="/dashboard"
                className="rounded-pill px-7 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-clay-100 hover:text-text"
              >
                {t("heroDemo")}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-clay-100 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/LN.png" alt="Langganin" className="h-6 w-6 opacity-60" />
            <span className="text-sm text-text-muted">{t("footerTagline")}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <span>{t("footerAbout")}</span>
            <span>{t("footerPrivacy")}</span>
            <span>{t("footerGitHub")}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
