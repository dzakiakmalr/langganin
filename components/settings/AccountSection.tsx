"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import SectionCard from "@/components/settings/SectionCard";
import { useRouter } from "@/i18n/navigation";

export default function AccountSection() {
  const t = useTranslations("Settings");
  const router = useRouter();

  const handleLogout = () => {
    // TODO(backend): call supabase.auth.signOut() here, then redirect.
    router.push("/login");
  };

  return (
    <SectionCard title={t("accountTitle")} description={t("accountDesc")}>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-1.5 rounded-pill bg-danger px-4 py-2 text-sm font-semibold text-white shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
      >
        <LogOut size={14} aria-hidden />
        {t("logoutButton")}
      </button>
      <p className="mt-3 text-xs text-text-muted">{t("logoutHint")}</p>
    </SectionCard>
  );
}
