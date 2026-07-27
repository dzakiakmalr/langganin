import type { Metadata } from "next";

import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Langganan",
};

export default function SubscriptionsPage() {
  return (
    <PlaceholderPage
      title="Langganan"
      description="Daftar semua langgananmu — lengkap dengan pencarian, filter kategori & status, dan tombol tambah langganan — akan ada di halaman ini."
    />
  );
}
