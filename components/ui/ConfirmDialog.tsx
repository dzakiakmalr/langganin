"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close dialog"
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />

      {/* Glass panel dialog */}
      <div className="glass-panel-lg relative z-10 w-full max-w-sm space-y-4 rounded-card p-6 shadow-lg">
        <h2 className="font-display text-lg font-bold text-text">{title}</h2>
        <p className="text-sm text-text-muted">{body}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-pill px-4 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-clay-100 hover:text-text"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-pill bg-danger px-4 py-2 text-sm font-semibold text-white shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-md"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
