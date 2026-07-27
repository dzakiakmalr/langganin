import type { Metadata } from "next";

import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Kalender",
};

export default function CalendarPage() {
  return (
    <PlaceholderPage
      title="Kalender"
      description="Tampilan kalender bulanan dengan penanda tanggal perpanjangan dan akhir trial (warna mengikuti kategori) akan ada di halaman ini."
    />
  );
}
