"use client";

import { useRef, useState } from "react";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SectionCard from "@/components/settings/SectionCard";
import { useSubscriptions } from "@/components/subscriptions/SubscriptionsProvider";
import {
  downloadJSON,
  parseImportPayload,
} from "@/lib/services/data-management";

export default function DataManagementSection() {
  const t = useTranslations("Settings");
  const { exportData, importData, resetData } = useSubscriptions();

  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetInput, setResetInput] = useState("");
  const [status, setStatus] = useState<null | "success" | "error">(null);

  const handleExport = () => {
    const json = exportData();
    const date = new Date().toISOString().slice(0, 10);
    downloadJSON(json, `langganin-backup-${date}.json`);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    if (parseImportPayload(text)) {
      setPendingImport(text);
      setImportConfirmOpen(true);
      setStatus(null);
    } else {
      setStatus("error");
    }
  };

  const confirmImport = () => {
    if (pendingImport !== null) {
      importData(pendingImport);
      setStatus("success");
    }
    setPendingImport(null);
    setImportConfirmOpen(false);
  };

  const confirmReset = () => {
    resetData();
    setResetOpen(false);
    setResetInput("");
  };

  const canReset = resetInput.trim().toUpperCase() === "RESET";

  return (
    <SectionCard title={t("dataTitle")} description={t("dataDesc")}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-pill bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover"
        >
          <Download size={14} aria-hidden />
          {t("exportButton")}
        </button>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-pill bg-clay-100 px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-clay-200 hover:text-text"
        >
          <Upload size={14} aria-hidden />
          {t("importButton")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFile}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => setResetOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
        >
          <AlertTriangle size={14} aria-hidden />
          {t("resetButton")}
        </button>
      </div>

      <p className="mt-3 text-xs text-text-muted">
        {t("exportHint")} · {t("importHint")} · {t("resetHint")}
      </p>

      {status && (
        <p
          role="status"
          className={`mt-3 text-xs font-semibold ${
            status === "success" ? "text-success" : "text-danger"
          }`}
        >
          {status === "success" ? t("importSuccess") : t("importError")}
        </p>
      )}

      {/* Import confirmation */}
      <ConfirmDialog
        open={importConfirmOpen}
        title={t("importConfirmTitle")}
        body={t("importConfirmBody")}
        confirmLabel={t("importButton")}
        cancelLabel={t("cancel")}
        onConfirm={confirmImport}
        onCancel={() => {
          setImportConfirmOpen(false);
          setPendingImport(null);
        }}
      />

      {/* Reset confirmation — type-to-confirm */}
      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={t("cancel")}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => {
              setResetOpen(false);
              setResetInput("");
            }}
          />
          <div className="glass-panel-lg relative z-10 w-full max-w-sm space-y-4 rounded-card p-6 shadow-lg">
            <h2 className="font-display text-lg font-bold text-text">
              {t("resetConfirmTitle")}
            </h2>
            <p className="text-sm text-text-muted">{t("resetConfirmBody")}</p>
            <input
              type="text"
              autoFocus
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              placeholder={t("resetPlaceholder")}
              className="w-full rounded-[14px] bg-surface-soft px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-danger/40"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setResetOpen(false);
                  setResetInput("");
                }}
                className="rounded-pill px-4 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-clay-100 hover:text-text"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                disabled={!canReset}
                onClick={confirmReset}
                className="rounded-pill bg-danger px-4 py-2 text-sm font-semibold text-white shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-md disabled:opacity-40"
              >
                {t("resetConfirmLabel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
