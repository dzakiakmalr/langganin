import type { Category, Subscription } from "@/types/subscription";
import { getRelevantDate } from "@/lib/utils/subscription-dates";

/**
 * Fold long lines at 75 octets per RFC 5545 §3.1.
 * A simple implementation — inserts CRLF + space after every 74 chars.
 */
function foldLine(input: string): string {
  const max = 74;
  if (input.length <= max) return input;
  const lines: string[] = [];
  for (let i = 0; i < input.length; i += max) {
    lines.push(i === 0 ? input.slice(i, i + max) : " " + input.slice(i, i + max));
  }
  return lines.join("\r\n");
}

/**
 * Escape ICS text: backslash-escape commas, semicolons, backslashes, and newlines.
 */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Generate a valid iCalendar (.ics) string from the given subscriptions.
 * Only active and trial subscriptions are included (paused/cancelled have
 * uncertain dates and aren't worth putting on a user's calendar).
 *
 * Each subscription becomes a single all-day VEVENT on the date returned
 * by getRelevantDate (trial_end_date for trials, next_billing_date for
 * active). Because it's an all-day event, the DTEND is the day after DTSTART.
 */
export function generateICS(
  subscriptions: Subscription[],
  categories: Category[],
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Langganin//Calendar//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    // A small timezone block so Apple Calendar / Google Calendar don't complain
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Jakarta",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0700",
    "TZOFFSETTO:+0700",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trial") continue;

    const eventDate = getRelevantDate(sub);
    const cat = categories.find((c) => c.id === sub.category_id);
    const dateStr = formatICSDate(eventDate);
    // DTEND is the day AFTER the event (all-day event convention)
    const endStr = formatICSDate(
      new Date(eventDate.getTime() + 24 * 60 * 60 * 1000),
    );

    const summary = escapeText(sub.name);
    const price = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(sub.price);

    const description = escapeText(
      [
        `Harga: ${price}`,
        `Siklus: ${cycleLabel(sub)}`,
        `Metode: ${paymentLabel(sub)}`,
        cat ? `Kategori: ${cat.name}` : "",
        sub.notes ? `Catatan: ${sub.notes}` : "",
      ]
        .filter(Boolean)
        .join("\\n"),
    );

    const cycleSuffix = sub.billing_cycle === "weekly" ? " (mingguan)" :
      sub.billing_cycle === "yearly" ? " (tahunan)" : "";

    lines.push(
      "BEGIN:VEVENT",
      `UID:langganin-${sub.id}@langganin.app`,
      foldLine(`DTSTART;VALUE=DATE:${dateStr}`),
      foldLine(`DTEND;VALUE=DATE:${endStr}`),
      foldLine(`SUMMARY:${summary}${cycleSuffix}`),
      foldLine(`DESCRIPTION:${description}`),
      sub.status === "trial" ? "CATEGORIES:Trial" : "CATEGORIES:Langganan",
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

function formatICSDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function cycleLabel(sub: Subscription): string {
  switch (sub.billing_cycle) {
    case "weekly": return "Mingguan";
    case "monthly": return "Bulanan";
    case "yearly": return "Tahunan";
    case "custom_days": return `${sub.custom_cycle_days ?? "?"} hari`;
    default: return sub.billing_cycle;
  }
}

function paymentLabel(sub: Subscription): string {
  const map: Record<string, string> = {
    credit_card: "Kartu Kredit",
    debit_card: "Kartu Debit",
    gopay: "GoPay",
    ovo: "OVO",
    dana: "DANA",
    shopeepay: "ShopeePay",
    qris: "QRIS",
    bank_transfer: "Transfer Bank",
    other: "Lainnya",
  };
  return map[sub.payment_method] ?? sub.payment_method;
}

/**
 * Trigger a browser download for a string payload.
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
