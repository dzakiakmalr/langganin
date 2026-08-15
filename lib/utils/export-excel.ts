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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generate an Excel-compatible SpreadsheetML (XML) string from the given
 * subscriptions. Excel opens this directly as a real .xls workbook — no
 * third-party dependency needed.
 *
 * Columns match generateCSV: Nama Layanan, Tanggal Jatuh Tempo, Harga,
 * Mata Uang, Siklus Tagihan, Kategori, Metode Pembayaran, Status.
 */
export function generateExcel(
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

  const xmlRows = rows
    .map(
      (row) =>
        "   <Row>" +
        row
          .map(
            (cell) =>
              `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`,
          )
          .join("") +
        "</Row>",
    )
    .join("\n");

  return [
    '<?xml version="1.0"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
    ' xmlns:o="urn:schemas-microsoft-com:office:office"',
    ' xmlns:x="urn:schemas-microsoft-com:office:excel"',
    ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    ' <Worksheet ss:Name="Langganan">',
    '  <Table>',
    xmlRows,
    '  </Table>',
    ' </Worksheet>',
    "</Workbook>",
  ].join("\n");
}

/**
 * Trigger a browser download for the SpreadsheetML string.
 */
export function downloadExcel(content: string, filename: string) {
  const blob = new Blob(["\uFEFF" + content], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
