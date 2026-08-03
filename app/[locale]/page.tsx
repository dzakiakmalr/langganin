import { getTranslations, setRequestLocale } from "next-intl/server";

import LandingNav from "@/components/LandingNav";
import { Link } from "@/i18n/navigation";

const paymentMethods = [
  {
    label: "GoPay",
    color: "#00A79D",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <circle cx="12" cy="12" r="10" fill="#00A79D" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="white"
        >
          G
        </text>
      </svg>
    ),
  },
  {
    label: "OVO",
    color: "#4A2691",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#4A2691" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill="white"
        >
          O
        </text>
      </svg>
    ),
  },
  {
    label: "DANA",
    color: "#0A6EBD",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <circle cx="12" cy="12" r="10" fill="#0A6EBD" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill="white"
        >
          D
        </text>
      </svg>
    ),
  },
  {
    label: "ShopeePay",
    color: "#EE4D2D",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#EE4D2D" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="white"
        >
          S
        </text>
      </svg>
    ),
  },
  {
    label: "QRIS",
    color: "#1B7A2B",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" fill="#1B7A2B" />
        <rect x="14" y="3" width="7" height="7" rx="1" fill="#1B7A2B" />
        <rect x="3" y="14" width="7" height="7" rx="1" fill="#1B7A2B" />
        <rect x="14" y="14" width="7" height="7" rx="1" fill="#1B7A2B" />
        <rect x="5" y="5" width="3" height="3" rx="0.5" fill="white" />
        <rect x="16" y="5" width="3" height="3" rx="0.5" fill="white" />
        <rect x="5" y="16" width="3" height="3" rx="0.5" fill="white" />
        <rect x="16" y="16" width="3" height="3" rx="0.5" fill="white" />
      </svg>
    ),
  },
  {
    label: "Bank Transfer",
    color: "#5C5A57",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <rect x="3" y="12" width="18" height="8" rx="1.5" fill="#7A6F63" />
        <path d="M4 12L12 4L20 12" stroke="#7A6F63" strokeWidth="2" />
        <rect x="10" y="14" width="4" height="4" rx="0.5" fill="white" />
      </svg>
    ),
  },
];

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

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative flex min-h-[75dvh] items-center justify-center overflow-hidden px-4 pb-10 pt-16 sm:pb-14 sm:pt-20">
        {/* Decorative blobs — brand-glow signature + neutral wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/3 -left-1/4 h-[70vh] w-[70vh] rounded-full opacity-60 blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(226,107,67,0.22) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-1/3 -right-1/4 h-[60vh] w-[60vh] rounded-full opacity-50 blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(234,230,224,0.6) 0%, transparent 70%)" }}
        />

        {/* macOS window */}
        <div className="relative w-full max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/62 shadow-lg backdrop-blur-2xl saturate-180">
            {/* Title bar */}
            <div className="flex items-center gap-3 border-b border-white/40 bg-gradient-to-r from-white/[0.12] to-white/[0.20] px-5 py-3.5">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full opacity-80 transition-opacity hover:opacity-100" style={{ backgroundColor: "#FF5F57" }} />
                <div className="h-3 w-3 rounded-full opacity-80 transition-opacity hover:opacity-100" style={{ backgroundColor: "#FEBC2E" }} />
                <div className="h-3 w-3 rounded-full opacity-80 transition-opacity hover:opacity-100" style={{ backgroundColor: "#28C840" }} />
              </div>
              <div className="flex-1 text-center text-xs font-medium text-text-muted">
                Langganin
              </div>
              <div className="w-16" />
            </div>

            {/* Content */}
            <div className="px-8 py-14 text-center sm:px-14 sm:py-20">
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-text sm:text-5xl sm:leading-tight">
                {t("heroHeadline")}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
                {t("heroSubheadline")}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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
          </div>
        </div>
      </section>

      {/* ── Feature Highlights ──────────────────────────────────── */}
      <section className="relative z-10 bg-page px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-card bg-surface p-6 shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:shadow-lg hover:-translate-y-[2px]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <path d="M9 14l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-text">
                {t("feature1Title")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {t("feature1Desc")}
              </p>
            </div>
            <div className="rounded-card bg-surface p-6 shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:shadow-lg hover:-translate-y-[2px]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 003.4 0" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-text">
                {t("feature2Title")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {t("feature2Desc")}
              </p>
            </div>
            <div className="rounded-card bg-surface p-6 shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:shadow-lg hover:-translate-y-[2px]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-8 4 4 4-6" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-text">
                {t("feature3Title")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {t("feature3Desc")}
              </p>
            </div>
            <div className="rounded-card bg-surface p-6 shadow-md transition-[transform,box-shadow] duration-300 ease-out hover:shadow-lg hover:-translate-y-[2px]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4" />
                  <path d="M8 2v4" />
                  <path d="M3 10h18" />
                  <path d="M8 14h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 18h.01" />
                  <path d="M12 18h.01" />
                  <path d="M16 18h.01" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-text">
                {t("feature4Title")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {t("feature4Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────── */}
      <section className="relative z-10 bg-page px-4 pb-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-card bg-surface p-6 text-center shadow-sm">
              <p className="font-display text-2xl font-bold text-brand-500 sm:text-3xl">
                50+
              </p>
              <p className="mt-1 text-sm text-text-muted">
                {locale === "id"
                  ? "Langganan yang bisa dipantau"
                  : "Subscriptions you can track"}
              </p>
            </div>
            <div className="rounded-card bg-surface p-6 text-center shadow-sm">
              <p className="font-display text-2xl font-bold text-brand-500 sm:text-3xl">
                D-3, D-1
              </p>
              <p className="mt-1 text-sm text-text-muted">
                {locale === "id"
                  ? "Pengingat sebelum kena charge"
                  : "Reminders before charge hits"}
              </p>
            </div>
            <div className="rounded-card bg-surface p-6 text-center shadow-sm">
              <p className="font-display text-2xl font-bold text-brand-500 sm:text-3xl">
                Rp 0
              </p>
              <p className="mt-1 text-sm text-text-muted">
                {locale === "id"
                  ? "Gratis, tanpa kartu kredit"
                  : "Free, no credit card needed"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Built for Indonesia ─────────────────────────────────── */}
      <section className="relative z-10 bg-page px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <svg
              viewBox="0 0 30 20"
              className="h-5 w-8 rounded shadow-sm"
              aria-hidden
            >
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
            {paymentMethods.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: `${p.color}0d`,
                  color: p.color,
                  border: `1px solid ${p.color}20`,
                }}
              >
                {p.icon}
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="relative z-10 bg-page px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-card bg-surface p-10 shadow-lg sm:p-14">
            <h2 className="font-display text-2xl font-bold text-text sm:text-3xl">
              {locale === "id"
                ? "Siap berhenti kaget sama tagihan?"
                : "Ready to stop surprise charges?"}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-text-muted">
              {locale === "id"
                ? "Mulai lacak langgananmu sekarang. Gratis."
                : "Start tracking your subscriptions now. Free."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-pill bg-brand-500 px-8 py-3 text-sm font-bold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover"
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
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
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
