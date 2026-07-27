import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Langganan",
};

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <section className="w-full max-w-4xl">
      <h1 className="font-display text-3xl font-bold">Detail Langganan</h1>
      <p className="mt-3 text-text-muted">
        Form edit lengkap (nama, kategori, harga, siklus tagihan, trial, metode
        pembayaran, catatan), riwayat event, dan aksi hapus untuk langganan ini
        akan tampil di sini.
      </p>
      <p className="mt-4 text-sm text-text-muted">
        ID langganan: <span className="font-medium text-text">{id}</span>
      </p>
    </section>
  );
}
