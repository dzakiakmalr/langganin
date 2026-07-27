import type { Metadata } from "next";

import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Analitik",
};

export default function AnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analitik"
      description="Tren pengeluaran dari waktu ke waktu, rincian per kategori, dan sorotan langganan termahal akan hadir di halaman ini (Fase 3)."
    />
  );
}
