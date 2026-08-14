"use client";

import { useEffect, useMemo, useState } from "react";
import { differenceInDays, startOfDay } from "date-fns";
import { CheckSquare, LayoutGrid, List, Settings2, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { useSubscriptions } from "@/components/subscriptions/SubscriptionsProvider";
import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";
import SubscriptionRow from "@/components/subscriptions/SubscriptionRow";
import SubscriptionForm from "@/components/subscriptions/SubscriptionForm";
import CategoryManagerModal from "@/components/subscriptions/CategoryManagerModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { SubscriptionInput } from "@/components/subscriptions/SubscriptionsProvider";
import type { Subscription } from "@/types/subscription";
import { getRelevantDate } from "@/lib/utils/subscription-dates";
import { findBrandByName } from "@/lib/brands/brand-registry";

type ViewMode = "card" | "list";
type GroupBy = "none" | "date" | "category" | "status";

type DateBucket = "overdue" | "today" | "tomorrow" | "thisWeek" | "nextWeek" | "thisMonth" | "later";

type Group = {
  key: string;
  label: string;
  color?: string;
  items: Subscription[];
};

const STORAGE_KEY_VIEW = "langganin.subscriptions.view";
const STORAGE_KEY_GROUP = "langganin.subscriptions.group";

const BUCKET_ORDER: DateBucket[] = [
  "overdue",
  "today",
  "tomorrow",
  "thisWeek",
  "nextWeek",
  "thisMonth",
  "later",
];

const STATUS_ORDER = ["active", "trial", "paused", "cancelled"] as const;

const STATUS_LABEL_KEY: Record<string, string> = {
  active: "rowStatusActive",
  trial: "rowStatusTrial",
  paused: "rowStatusPaused",
  cancelled: "rowStatusCancelled",
};

function readStored<T extends string>(
  key: string,
  valid: readonly T[],
  fallback: T,
): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw && (valid as readonly string[]).includes(raw)) return raw as T;
  } catch {
    // localStorage may be unavailable (private browsing, SSR, etc.)
  }
  return fallback;
}

function writeStored(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function getDateBucket(date: Date, today: Date): DateBucket {
  const days = differenceInDays(date, today);
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days <= 7) return "thisWeek";
  if (days <= 14) return "nextWeek";
  if (days <= 30) return "thisMonth";
  return "later";
}

export default function SubscriptionsListClient({
  initialQuery,
}: {
  /** Pre-fill search from the topbar search (?q=...). */
  initialQuery?: string;
}) {
  const t = useTranslations("Subscriptions");
  const tf = useTranslations("SubscriptionForm");
  const { subscriptions, categories, addSubscription, deleteSubscription } =
    useSubscriptions();

  const [search, setSearch] = useState(initialQuery ?? "");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setViewMode(readStored(STORAGE_KEY_VIEW, ["card", "list"] as const, "card"));
    setGroupBy(
      readStored(
        STORAGE_KEY_GROUP,
        ["none", "date", "category", "status"] as const,
        "none",
      ),
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStored(STORAGE_KEY_VIEW, viewMode);
  }, [viewMode, hydrated]);

  useEffect(() => {
    if (hydrated) writeStored(STORAGE_KEY_GROUP, groupBy);
  }, [groupBy, hydrated]);

  // Prune stale selections when subscriptions change (e.g. single delete).
  useEffect(() => {
    setSelectedIds((prev) => {
      const valid = new Set(subscriptions.map((s) => s.id));
      const next = new Set([...prev].filter((id) => valid.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [subscriptions]);

  // Sync search when the topbar search navigates here with a new ?q=.
  useEffect(() => {
    if (initialQuery !== undefined) setSearch(initialQuery);
  }, [initialQuery]);

  const today = useMemo(() => startOfDay(new Date()), []);

  const filtered = useMemo(() => {
    let result = subscriptions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (filterCategory) {
      result = result.filter((s) => s.category_id === filterCategory);
    }
    if (filterStatus) {
      result = result.filter((s) => s.status === filterStatus);
    }
    return result;
  }, [subscriptions, search, filterCategory, filterStatus]);

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          getRelevantDate(a).getTime() - getRelevantDate(b).getTime(),
      ),
    [filtered],
  );

  const groups: Group[] = useMemo(() => {
    if (groupBy === "none") {
      return [{ key: "_all", label: "", items: sorted }];
    }

    if (groupBy === "date") {
      const buckets = new Map<DateBucket, Subscription[]>();
      for (const sub of sorted) {
        const b = getDateBucket(getRelevantDate(sub), today);
        const list = buckets.get(b) ?? [];
        list.push(sub);
        buckets.set(b, list);
      }
      return BUCKET_ORDER.filter((b) => buckets.has(b)).map((b) => ({
        key: b,
        label: t(`bucket${b.charAt(0).toUpperCase() + b.slice(1)}` as
          | "bucketOverdue"
          | "bucketToday"
          | "bucketTomorrow"
          | "bucketThisWeek"
          | "bucketNextWeek"
          | "bucketThisMonth"
          | "bucketLater"),
        items: buckets.get(b) ?? [],
      }));
    }

    if (groupBy === "category") {
      const map = new Map<string, { cat: (typeof categories)[number] | undefined; items: Subscription[] }>();
      for (const sub of sorted) {
        const cat = categories.find((c) => c.id === sub.category_id);
        const key = sub.category_id ?? "_none";
        const existing = map.get(key);
        if (existing) {
          existing.items.push(sub);
        } else {
          map.set(key, { cat, items: [sub] });
        }
      }
      return Array.from(map.entries())
        .sort((a, b) => {
          const an = a[1].cat?.name ?? "—";
          const bn = b[1].cat?.name ?? "—";
          return an.localeCompare(bn);
        })
        .map(([key, { cat, items }]) => ({
          key,
          label: cat?.name ?? "—",
          color: cat?.color ?? undefined,
          items,
        }));
    }

    // status
    const map = new Map<string, Subscription[]>();
    for (const sub of sorted) {
      const list = map.get(sub.status) ?? [];
      list.push(sub);
      map.set(sub.status, list);
    }
    return STATUS_ORDER.filter((s) => map.has(s)).map((s) => ({
      key: s,
      label: t(STATUS_LABEL_KEY[s] as "rowStatusActive" | "rowStatusTrial" | "rowStatusPaused" | "rowStatusCancelled"),
      items: map.get(s) ?? [],
    }));
  }, [sorted, groupBy, categories, t, today]);

  const handleAdd = (data: SubscriptionInput) => {
    addSubscription(data);
    setShowAddModal(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id));

  const toggleSelectAll = () => {
    setSelectedIds(allFilteredSelected ? new Set() : new Set(filtered.map((s) => s.id)));
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteSubscription(id));
    clearSelection();
    setSelectMode(false);
    setShowBulkDelete(false);
  };

  const isList = viewMode === "list";
  const showHeaders = groupBy !== "none";

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1 rounded-pill bg-surface-soft px-4 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        <select
          aria-label={t("filterCategory")}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-pill bg-surface-soft px-4 py-2 text-sm text-text"
        >
          <option value="">{t("filterCategory")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label={t("filterStatus")}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-pill bg-surface-soft px-4 py-2 text-sm text-text"
        >
          <option value="">{t("filterStatus")}</option>
          <option value="active">{t("rowStatusActive")}</option>
          <option value="trial">{t("rowStatusTrial")}</option>
          <option value="paused">{t("rowStatusPaused")}</option>
          <option value="cancelled">{t("rowStatusCancelled")}</option>
        </select>

        {/* Display zone: group + view toggle */}
        <div className="flex items-center gap-2">
          <select
            aria-label={t("groupBy")}
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="rounded-pill bg-surface-soft px-4 py-2 text-sm text-text"
          >
            <option value="none">{t("groupNone")}</option>
            <option value="date">{t("groupDate")}</option>
            <option value="category">{t("groupCategory")}</option>
            <option value="status">{t("groupStatus")}</option>
          </select>

          <div
            role="group"
            aria-label={t("viewCard")}
            className="glass-panel relative flex items-center gap-0.5 rounded-pill p-1"
          >
            <button
              type="button"
              aria-pressed={!isList}
              aria-label={t("viewCard")}
              onClick={() => setViewMode("card")}
              className="relative flex h-8 w-8 items-center justify-center rounded-pill text-text-muted transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              {!isList && (
                <motion.span
                  layoutId="subs-view-pill"
                  className="absolute inset-0 rounded-pill bg-brand-500 shadow-clay"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <LayoutGrid
                size={15}
                className={`relative z-10 ${!isList ? "text-white" : ""}`}
                aria-hidden
              />
            </button>
            <button
              type="button"
              aria-pressed={isList}
              aria-label={t("viewList")}
              onClick={() => setViewMode("list")}
              className="relative flex h-8 w-8 items-center justify-center rounded-pill text-text-muted transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              {isList && (
                <motion.span
                  layoutId="subs-view-pill"
                  className="absolute inset-0 rounded-pill bg-brand-500 shadow-clay"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <List
                size={15}
                className={`relative z-10 ${isList ? "text-white" : ""}`}
                aria-hidden
              />
            </button>
          </div>
        </div>

        <button
          type="button"
          aria-pressed={selectMode}
          onClick={() => {
            if (selectMode) clearSelection();
            setSelectMode((v) => !v);
          }}
          className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
            selectMode
              ? "bg-brand-500 text-white shadow-clay"
              : "bg-clay-100 text-text-muted hover:bg-clay-200 hover:text-text"
          }`}
        >
          <CheckSquare size={14} aria-hidden />
          <span>{t("bulkSelect")}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowCategoryManager(true)}
          className="hidden items-center gap-1.5 rounded-pill bg-clay-100 px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-clay-200 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 sm:inline-flex"
        >
          <Settings2 size={14} aria-hidden />
          <span>{t("manageCategories")}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="rounded-pill bg-brand-500 px-5 py-2 text-sm font-bold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover"
        >
          + {t("addButton")}
        </button>
      </div>

      {/* List / grid */}
      {sorted.length === 0 ? (
        <div className="rounded-card bg-surface p-12 text-center shadow-sm">
          <p className="text-text-muted">{t("noResults")}</p>
        </div>
      ) : (
        <div className={showHeaders ? "space-y-6" : ""}>
          {groups.map((group) => (
            <section
              key={group.key}
              aria-label={group.label || undefined}
              className="space-y-3"
            >
              {showHeaders && (
                <div className="flex items-center justify-between border-b border-clay-100 pb-2">
                  <div className="flex items-center gap-2">
                    {group.color && (
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: group.color }}
                        aria-hidden
                      />
                    )}
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      {group.label}
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums text-text-subtle">
                    {t("groupCount", { count: group.items.length })}
                  </span>
                </div>
              )}

              {isList ? (
                <div className="space-y-1.5">
                  {group.items.map((sub) => {
                    const cat = categories.find((c) => c.id === sub.category_id);
                    const brand = findBrandByName(sub.name);
                    return (
                      <SubscriptionRow
                        key={sub.id}
                        subscription={sub}
                        categoryName={cat?.name}
                        categoryColor={cat?.color}
                        brandColor={brand?.color}
                        selectable={selectMode}
                        selected={selectedIds.has(sub.id)}
                        onToggleSelect={() => toggleSelect(sub.id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((sub) => {
                    const cat = categories.find((c) => c.id === sub.category_id);
                    const brand = findBrandByName(sub.name);
                    return (
                      <SubscriptionCard
                        key={sub.id}
                        subscription={sub}
                        categoryName={cat?.name}
                        categoryColor={cat?.color}
                        brandColor={brand?.color}
                        selectable={selectMode}
                        selected={selectedIds.has(sub.id)}
                        onToggleSelect={() => toggleSelect(sub.id)}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-20">
          <button
            type="button"
            aria-label={tf("cancel")}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setShowAddModal(false)}
          />
          <div className="glass-panel-lg relative z-10 w-full max-w-lg rounded-card p-6 shadow-lg">
            <h2 className="font-display text-lg font-bold text-text">
              {tf("titleAdd")}
            </h2>
            <div className="mt-5">
              <SubscriptionForm
                mode="add"
                categories={categories.map((c) => ({ id: c.id, name: c.name }))}
                onSubmit={handleAdd}
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Category manager modal */}
      <CategoryManagerModal
        open={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />

      {/* Bulk action bar */}
      {selectMode && selectedIds.size > 0 && (
        <>
          <div aria-hidden className="h-16" />
          <div className="fixed inset-x-0 bottom-4 z-40 px-4">
            <div className="glass-panel mx-auto flex max-w-xl flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-pill px-4 py-2.5 shadow-lg">
              <span className="text-sm font-semibold tabular-nums text-text">
                {t("bulkSelected", { count: selectedIds.size })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="rounded-pill px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:bg-clay-100 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                >
                  {allFilteredSelected
                    ? t("bulkDeselectAll")
                    : t("bulkSelectAll")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-pill bg-danger px-4 py-1.5 text-xs font-bold text-white transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
                >
                  <Trash2 size={14} aria-hidden />
                  {t("bulkDelete")}
                </button>
                <button
                  type="button"
                  aria-label={t("bulkClear")}
                  onClick={clearSelection}
                  className="flex h-8 w-8 items-center justify-center rounded-pill text-text-muted transition-colors hover:bg-clay-100 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                >
                  <X size={15} aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={showBulkDelete}
        title={t("bulkDeleteTitle", { count: selectedIds.size })}
        body={t("bulkDeleteBody", { count: selectedIds.size })}
        confirmLabel={t("deleteButton")}
        cancelLabel={tf("cancel")}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowBulkDelete(false)}
      />
    </div>
  );
}
