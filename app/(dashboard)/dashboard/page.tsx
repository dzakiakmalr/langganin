import type { Metadata } from "next";

import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Dasbor",
};

export default function DashboardPage() {
  return (
    <PlaceholderPage
      title="Dasbor"
      description="Ringkasan total pengeluaran bulanan & tahunan (proyeksi), daftar perpanjangan 7 dan 30 hari ke depan, serta grafik pengeluaran per kategori akan tampil di sini."
    />
  );
}
