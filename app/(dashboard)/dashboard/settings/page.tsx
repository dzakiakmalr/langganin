import type { Metadata } from "next";

import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Pengaturan",
};

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Pengaturan"
      description="Profil (mata uang default, zona waktu, batas bujet bulanan), kategori kustom dengan warna, dan preferensi notifikasi akan diatur di halaman ini."
    />
  );
}
