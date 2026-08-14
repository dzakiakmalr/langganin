import type { Category, Subscription } from "@/types/subscription";
import type { ReminderPreferences } from "@/types/notifications";

/**
 * Data-management utilities — manual backup/restore while there's no backend.
 * All app state lives in Context + localStorage, so these give the user an
 * escape hatch: export to JSON, import it back, or wipe everything.
 */

/** The shape of an exported backup file. */
export type ExportPayload = {
  app: "langganin";
  version: number;
  exportedAt: string;
  profileName: string;
  currencyFormat: "id" | "en";
  defaultCurrency: string;
  paymentMethods: string[];
  subscriptions: Subscription[];
  categories: Category[];
  preferences: ReminderPreferences;
};

/** Everything the caller must provide to build a backup (the rest is stamped). */
export type ExportDataInput = Omit<
  ExportPayload,
  "app" | "version" | "exportedAt"
>;

const EXPORT_VERSION = 1;

export function buildExportPayload(input: ExportDataInput): ExportPayload {
  return {
    app: "langganin",
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    ...input,
  };
}

/** Serialize a payload to a pretty-printed JSON string. */
export function exportDataAsJSON(payload: ExportPayload): string {
  return JSON.stringify(payload, null, 2);
}

/** Parse + validate a backup string. Returns null when the file is not ours. */
export function parseImportPayload(json: string): ExportPayload | null {
  try {
    const parsed = JSON.parse(json);
    if (
      !parsed ||
      parsed.app !== "langganin" ||
      !Array.isArray(parsed.subscriptions) ||
      !Array.isArray(parsed.categories) ||
      !parsed.preferences
    ) {
      return null;
    }
    return {
      ...parsed,
      defaultCurrency:
        typeof parsed.defaultCurrency === "string"
          ? parsed.defaultCurrency
          : "IDR",
      currencyFormat:
        parsed.currencyFormat === "en" ? "en" : "id",
    } as ExportPayload;
  } catch {
    return null;
  }
}

/** Read a File object and return the validated payload (throws on failure). */
export function importDataFromJSON(file: File): Promise<ExportPayload> {
  return file.text().then((text) => {
    const parsed = parseImportPayload(text);
    if (!parsed) {
      throw new Error("InvalidLangganinBackup");
    }
    return parsed;
  });
}

/** Trigger a browser download for a text/JSON string. */
export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Remove every Langganin localStorage entry. */
export function resetAllData(): void {
  if (typeof window === "undefined") return;
  const keys = Object.keys(window.localStorage).filter((k) =>
    k.startsWith("langganin."),
  );
  for (const key of keys) {
    window.localStorage.removeItem(key);
  }
}
