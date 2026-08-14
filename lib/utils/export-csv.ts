import type { Category, Subscription } from "@/types/subscription";
import { getRelevantDate } from "@/lib/utils/subscription-dates";

const CYCLE_LABEL: Record<string, string> = {
  weekly: "Mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
  custom_days: "Kustom",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  trial: "Trial",
  paused: "Ditunda",
  cancelled: "Baru dihapus",
};

/**
 * Generate a UTF-8 CSV string from the given subscriptions. The output
 * is BOM-prefixed so Excel opens Indonesian text correctly.
 *
 * Columns: Nama Layanan, Tanggal Jatuh Tempo, Harga, Mata Uang,
 *          Siklus Tagihan, Kategori, Metode Pembayaran, Status
 */
export function generateCSV(
  subscriptions: Subscription[],
  categories: Category[],
): string {
  const header = [
    "Nama Layanan",
    "Tanggal Jatuh Tempo",
    "Harga",
    "Mata Uang",
    "Siklus Tagihan",
    "Kategori",
    "Metode Pembayaran",
    "Status",
  ];

  const rows: string[][] = [header];

  for (const sub of subscriptions) {
    const relevantDate = getRelevantDate(sub);
    const y = relevantDate.getFullYear();
    const m = String(relevantDate.getMonth() + 1).padStart(2, "0");
    const d = String(relevantDate.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    const cat = categories.find((c) => c.id === sub.category_id);
    const cycleStr =
      sub.billing_cycle === "custom_days"
        ? `${sub.custom_cycle_days ?? "?"} hari`
        : CYCLE_LABEL[sub.billing_cycle] ?? sub.billing_cycle;

    rows.push([
      sub.name,
      dateStr,
      String(sub.price),
      sub.currency,
      cycleStr,
      cat?.name ?? "—",
      sub.payment_method,
      STATUS_LABEL[sub.status] ?? sub.status,
    ]);
  }

  // Build CSV with proper escaping (quotes around fields containing commas)
  const csvLines = rows.map((r) =>
    r
      .map((v) =>
        v.includes(",") || v.includes('"') || v.includes("\n")
          ? `"${v.replace(/"/g, '""')}"`
          : v,
      )
      .join(","),
  );

  // BOM prefix so Excel reads UTF-8
  return "\uFEFF" + csvLines.join("\n");
}

/**
 * Trigger a browser download for a CSV string.
 */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
