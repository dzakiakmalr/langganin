"use client";

import { useTranslations } from "next-intl";
import { Play } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { enterDemo } from "@/lib/demo";

/**
 * Temporary "demo" entry on the landing page: sets the demo cookie and jumps
 * straight into the dashboard without a real account.
 */
export default function DemoButton() {
  const t = useTranslations("Landing");
  const router = useRouter();

  const handleDemo = () => {
    enterDemo();
    router.push("/dashboard");
  };

  return (
    <button
      type="button"
      onClick={handleDemo}
      className="inline-flex items-center gap-1.5 rounded-pill px-7 py-3 text-sm font-semibold text-text-muted transition-colors hover:bg-clay-100 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
    >
      <Play size={15} aria-hidden />
      {t("heroDemo")}
    </button>
  );
}
