"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Plus, Settings2, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  useSubscriptions,
  type CategoryInput,
} from "@/components/SubscriptionsProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Category } from "@/types/subscription";

/** 12 preset swatches, all reusing the existing design-system palette. */
const PRESET_COLORS: readonly string[] = [
  "#E26B43", // brand-500 (terracotta)
  "#2F8F5E", // success (green)
  "#3D6FCC", // info (blue)
  "#C77B1E", // warning (amber)
  "#B43C2C", // danger (red)
  "#5C5A57", // text-muted (slate)
  "#00A79D", // teal
  "#4A2691", // indigo
  "#D63384", // pink
  "#611F69", // violet
  "#0EA5E9", // sky
  "#0F766E", // cyan
];

type CategoryManagerModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CategoryManagerModal({
  open,
  onClose,
}: CategoryManagerModalProps) {
  const t = useTranslations("Subscriptions");
  const { categories, addCategory, updateCategory, deleteCategory } =
    useSubscriptions();

  // Form state — null = no row being edited, "new" = creating, Category = editing that one.
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(PRESET_COLORS[0]);
  const [error, setError] = useState<null | "required" | "duplicate">(null);

  // Delete confirmation — the category pending deletion
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const titleId = "category-manager-title";
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Escape + click-outside close (only when no form is open / no dialog is showing)
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (pendingDelete) return; // ConfirmDialog handles its own Escape
        if (editing) {
          cancelEdit();
        } else {
          onClose();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, editing, pendingDelete, onClose]);

  // Focus the first field when entering edit/create mode
  useEffect(() => {
    if (editing) {
      // small delay so the form is mounted
      const t = window.setTimeout(() => firstFieldRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
  }, [editing]);

  // Sort: defaults first, then user-created (each alphabetical)
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const aIsDefault = a.user_id === null;
      const bIsDefault = b.user_id === null;
      if (aIsDefault !== bIsDefault) return aIsDefault ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

  if (!open) return null;

  function startCreate() {
    setEditing("new");
    setName("");
    setColor(PRESET_COLORS[0]);
    setError(null);
  }

  function startEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setColor(c.color);
    setError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setName("");
    setColor(PRESET_COLORS[0]);
    setError(null);
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("required");
      return;
    }
    // Duplicate check (case-insensitive), excluding the row being edited
    const dup = categories.some(
      (c) =>
        c.id !== (typeof editing === "object" && editing ? editing.id : "") &&
        c.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (dup) {
      setError("duplicate");
      return;
    }

    if (editing === "new") {
      const input: CategoryInput = {
        name: trimmed,
        color: color ?? PRESET_COLORS[0],
        icon: null,
      };
      addCategory(input);
    } else if (editing) {
      updateCategory(editing.id, {
        name: trimmed,
        color: color ?? PRESET_COLORS[0],
        icon: null,
      });
    }
    cancelEdit();
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    deleteCategory(pendingDelete.id);
    setPendingDelete(null);
  }

  // Sort: defaults first, then user-created (each alphabetical)
  // (declared above before the early return so hook order is stable)

  const isEditingNew = editing === "new";
  const isEditingExisting = typeof editing === "object" && editing !== null;
  const formIsOpen = editing !== null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={() => {
          if (editing) cancelEdit();
          else onClose();
        }}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      >
        <div className="glass-panel-lg relative w-full max-w-[480px] rounded-card p-6 shadow-lg">
          {/* Header */}
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600"
              >
                <Settings2 size={16} />
              </span>
              <h2
                id={titleId}
                className="font-display text-lg font-bold text-text"
              >
                {t("manageCategories")}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                if (editing) cancelEdit();
                else onClose();
              }}
              aria-label={t("cancel")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-clay-100 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              <X size={16} />
            </button>
          </div>

          {/* Create button (hidden while form is open) */}
          {!formIsOpen && (
            <button
              type="button"
              onClick={startCreate}
              className="mb-4 flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-clay-200 bg-clay-100 px-4 py-2.5 text-sm font-semibold text-text-muted transition-colors hover:bg-clay-200 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              <Plus size={14} aria-hidden />
              {t("newCategory")}
            </button>
          )}

          {/* Inline form (create or edit) */}
          {formIsOpen && (
            <div className="mb-4 rounded-[14px] border border-clay-100 bg-clay-100/40 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {isEditingNew ? t("newCategory") : t("save")}
              </p>

              {/* Name */}
              <div className="mb-3">
                <label
                  htmlFor="cat-name"
                  className="mb-1 block text-xs font-semibold text-text"
                >
                  {t("categoryName")}
                </label>
                <input
                  ref={firstFieldRef}
                  id="cat-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  placeholder={t("categoryNamePlaceholder")}
                  className={`w-full rounded-[12px] bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 ${
                    error
                      ? "ring-2 ring-danger/40"
                      : "focus:ring-brand-500/30"
                  }`}
                />
                {error && (
                  <p role="alert" className="mt-1 text-xs text-danger">
                    {error === "required"
                      ? t("nameRequired")
                      : t("nameDuplicate")}
                  </p>
                )}
              </div>

              {/* Color picker */}
              <div className="mb-4">
                <p className="mb-1.5 text-xs font-semibold text-text">
                  {t("categoryColor")}
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((c) => {
                    const active = color === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        aria-pressed={active}
                        aria-label={c}
                        className={`relative h-8 w-8 rounded-full transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                          active
                            ? "scale-110 ring-2 ring-offset-2 ring-offset-clay-100/40"
                            : "hover:scale-105"
                        }`}
                        style={{
                          backgroundColor: c,
                          // active ring uses the same color for self-affirmation;
                          // inactive uses a neutral ring
                          ...(active
                            ? { boxShadow: `0 0 0 2px ${c}` }
                            : {}),
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-pill px-4 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-clay-200 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-pill bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                >
                  {isEditingNew ? t("create") : t("save")}
                </button>
              </div>
            </div>
          )}

          {/* Category list */}
          {sortedCategories.length === 0 && !formIsOpen ? (
            <p className="rounded-[14px] bg-clay-100 px-4 py-6 text-center text-sm text-text-muted">
              {t("categoryEmpty")}
            </p>
          ) : (
            <ul role="list" className="max-h-[320px] space-y-1.5 overflow-y-auto">
              {sortedCategories.map((c) => {
                const isDefault = c.user_id === null;
                const isBeingEdited =
                  isEditingExisting && editing && editing.id === c.id;
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 rounded-[14px] bg-clay-100 px-3 py-2.5"
                  >
                    <span
                      aria-hidden
                      className="h-5 w-5 shrink-0 rounded-full"
                      style={{ backgroundColor: c.color ?? "#8C8884" }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-text">
                          {c.name}
                        </span>
                        {isDefault ? (
                          <span
                            className="rounded-pill bg-clay-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-text-muted"
                            title="Default"
                          >
                            {t("categoryDefault")}
                          </span>
                        ) : (
                          <span
                            className="rounded-pill bg-brand-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-600"
                            title="New"
                          >
                            {t("categoryNew")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        disabled={formIsOpen && !isBeingEdited}
                        aria-label={`${t("save")} ${c.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-clay-200 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(c)}
                        disabled={formIsOpen}
                        aria-label={`${t("categoryDeleteTitle")} ${c.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-danger/10 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("categoryDeleteTitle")}
        body={
          pendingDelete
            ? `${pendingDelete.name} — ${t("categoryDeleteBody")}`
            : t("categoryDeleteBody")
        }
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
