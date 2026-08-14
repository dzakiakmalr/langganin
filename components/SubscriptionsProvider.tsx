"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Category, Subscription } from "@/types/subscription";
import { DELETED_RETENTION_DAYS } from "@/types/subscription";
import {
  type AppNotification,
  type NotificationChannel,
  type ReminderPreferences,
  type SubscriptionOverride,
} from "@/types/notifications";
import { mockCategories, mockSubscriptions } from "@/lib/mock/subscriptions";
import {
  DEFAULT_REMINDER_PREFERENCES,
  generateNotifications,
} from "@/lib/utils/notifications";
import { DEFAULT_PAYMENT_METHODS } from "@/lib/payment-methods";
import {
  buildExportPayload,
  exportDataAsJSON,
  parseImportPayload,
  resetAllData,
} from "@/lib/services/data-management";

// TODO(backend): replace with real query — see 06-API-CONTRACT.md
// The hook shape below is intentionally stable so consuming components
// won't need to change when the internals switch from in-memory state
// to Server Actions / Route Handlers.

export type SubscriptionInput = Omit<
  Subscription,
  "id" | "user_id" | "created_at" | "updated_at" | "deleted_at"
>;

/** Input for creating/editing a Category — fields the user controls. */
export type CategoryInput = {
  name: string;
  color: string;
  icon: string | null;
};

type SubscriptionsContextType = {
  // ── Subscriptions (existing) ──
  subscriptions: Subscription[];
  categories: Category[];
  getById: (id: string) => Subscription | undefined;
  addSubscription: (data: SubscriptionInput) => void;
  updateSubscription: (id: string, data: Partial<SubscriptionInput>) => void;
  deleteSubscription: (id: string) => void;
  restoreSubscription: (id: string) => void;

  // ── Profile / Settings (new) ──
  /** Display name used for the topbar greeting + avatar initial. */
  profileName: string;
  setProfileName: (name: string) => void;
  /** Number/currency thousands separator preference. */
  currencyFormat: "id" | "en";
  setCurrencyFormat: (format: "id" | "en") => void;
  /** Default currency code (e.g. "IDR") for new subscriptions. */
  defaultCurrency: string;
  setDefaultCurrency: (currency: string) => void;
  /** Favorite payment methods, surfaced first in the subscription form. */
  paymentMethods: string[];
  addPaymentMethod: (method: string) => void;
  removePaymentMethod: (method: string) => void;

  // ── Data management (no backend yet) ──
  /** Serialize the whole app state to a JSON backup string. */
  exportData: () => string;
  /** Replace the whole app state from a JSON backup string. */
  importData: (json: string) => boolean;
  /** Wipe all local data + localStorage back to defaults. */
  resetData: () => void;

  // ── Categories (new slice) ──
  /** Create a new user-owned category. */
  addCategory: (data: CategoryInput) => void;
  /** Update a category by id (name / color / icon). */
  updateCategory: (id: string, data: Partial<CategoryInput>) => void;
  /**
   * Delete a category by id. Any subscription with `category_id` matching
   * this id will be moved to "uncategorized" (category_id = null).
   */
  deleteCategory: (id: string) => void;

  // ── Notifications (new slice) ──
  /** Full preference object: global defaults + per-subscription overrides. */
  preferences: ReminderPreferences;
  /** Update the global default H- + channels. */
  updateGlobalPreferences: (next: SubscriptionOverride) => void;
  /**
   * Set a per-subscription override. Pass `null` to clear the override
   * (subscription will fall back to global defaults).
   */
  setSubscriptionOverride: (
    subscriptionId: string,
    override: SubscriptionOverride | null,
  ) => void;
  /** All currently-active notifications (sorted by urgency). */
  notifications: AppNotification[];
  /** How many notifications the user hasn't read yet. */
  unreadCount: number;
  /** Mark a single notification as read. */
  markAsRead: (id: string) => void;
  /**
   * Mark every active notification as read. The caller passes the current
   * snapshot of notifications (since the closure here can't see them).
   */
  markAllAsRead: (list: AppNotification[]) => void;
};

const Ctx = createContext<SubscriptionsContextType | undefined>(undefined);

// localStorage keys (preferences + read state) — survives reloads, like
// the existing view+group state on the Subscriptions page.
const STORAGE_KEY_PREFS = "langganin.notifications.prefs";
const STORAGE_KEY_READ = "langganin.notifications.read";
const STORAGE_HYDRATED = "langganin.notifications.hydrated";
const STORAGE_KEY_SETTINGS = "langganin.settings";

function readStoredPrefs(): ReminderPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFS);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      global?: Partial<Record<"daysBefore" | "trialDaysBefore" | "channels", unknown>>;
      perSubscription?: Record<string, Partial<Record<"daysBefore" | "trialDaysBefore" | "channels", unknown>> | null>;
    };
    if (!parsed.global || !parsed.perSubscription) return null;

    const gDays = Array.isArray(parsed.global.daysBefore)
      ? (parsed.global.daysBefore as number[])
      : DEFAULT_REMINDER_PREFERENCES.global.daysBefore;
    // Older stored data had no trialDaysBefore — fall back to renewal days.
    const gTrial = Array.isArray(parsed.global.trialDaysBefore)
      ? (parsed.global.trialDaysBefore as number[])
      : gDays;
    const gChannels = Array.isArray(parsed.global.channels)
      ? (parsed.global.channels as NotificationChannel[])
      : DEFAULT_REMINDER_PREFERENCES.global.channels;

    const perSubscription: ReminderPreferences["perSubscription"] = {};
    for (const [id, ov] of Object.entries(parsed.perSubscription)) {
      if (!ov) {
        perSubscription[id] = null;
        continue;
      }
      perSubscription[id] = {
        daysBefore: Array.isArray(ov.daysBefore) ? (ov.daysBefore as number[]) : gDays,
        trialDaysBefore: Array.isArray(ov.trialDaysBefore)
          ? (ov.trialDaysBefore as number[])
          : gTrial,
        channels: Array.isArray(ov.channels)
          ? (ov.channels as NotificationChannel[])
          : gChannels,
      };
    }

    return {
      global: { daysBefore: gDays, trialDaysBefore: gTrial, channels: gChannels },
      perSubscription,
    };
  } catch {
    // ignore
  }
  return null;
}

function writeStoredPrefs(prefs: ReminderPreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

function readStoredRead(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_READ);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredRead(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

type StoredSettings = {
  profileName: string;
  currencyFormat: "id" | "en";
  defaultCurrency: string;
  paymentMethods: string[];
};

function readStoredSettings(): StoredSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.profileName === "string" &&
      (parsed.currencyFormat === "id" || parsed.currencyFormat === "en") &&
      Array.isArray(parsed.paymentMethods)
    ) {
      return {
        profileName: parsed.profileName,
        currencyFormat: parsed.currencyFormat,
        defaultCurrency:
          typeof parsed.defaultCurrency === "string"
            ? parsed.defaultCurrency
            : "IDR",
        paymentMethods: parsed.paymentMethods,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function writeStoredSettings(settings: StoredSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/** True once a soft-deleted subscription has passed the retention window. */
function isExpiredDeleted(s: Subscription): boolean {
  if (s.status !== "cancelled" || !s.deleted_at) return false;
  const deletedAt = new Date(s.deleted_at).getTime();
  const cutoff = Date.now() - DELETED_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return deletedAt < cutoff;
}

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  // TODO(backend): replace seed with real query — see 06-API-CONTRACT.md
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(mockSubscriptions);
  // Default categories (user_id: null) are the immutable seed; user-owned
  // categories are added at runtime via addCategory. The exposed `categories`
  // is the merged list, so every consumer (filter dropdown, form picker,
  // card tint, etc.) sees new categories automatically.
  const [categories, setCategories] = useState<Category[]>(mockCategories);

  // ── Notifications state ──
  const [preferences, setPreferences] = useState<ReminderPreferences>(
    DEFAULT_REMINDER_PREFERENCES,
  );
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // ── Profile / Settings state ──
  const [profileName, setProfileName] = useState("");
  const [currencyFormat, setCurrencyFormat] = useState<"id" | "en">("id");
  const [defaultCurrency, setDefaultCurrency] = useState("IDR");
  const [paymentMethods, setPaymentMethods] = useState<string[]>([
    ...DEFAULT_PAYMENT_METHODS,
  ]);

  // Hydrate from localStorage on mount (avoids SSR/CSR mismatch).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = readStoredPrefs();
    if (stored) setPreferences(stored);
    const storedRead = readStoredRead();
    if (storedRead.length > 0) setReadIds(new Set(storedRead));
    const storedSettings = readStoredSettings();
    if (storedSettings) {
      setProfileName(storedSettings.profileName);
      setCurrencyFormat(storedSettings.currencyFormat);
      setDefaultCurrency(storedSettings.defaultCurrency);
      setPaymentMethods(storedSettings.paymentMethods);
    }
    setHydrated(true);
    // Mark hydration in a separate key so we can short-circuit writes
    // before the first effect runs.
    try {
      window.localStorage.setItem(STORAGE_HYDRATED, "1");
    } catch {
      // ignore
    }
  }, []);

  // Persist settings on change (skip until hydrated so we don't clobber
  // stored data with defaults on the first render).
  useEffect(() => {
    if (hydrated) {
      writeStoredSettings({
        profileName,
        currencyFormat,
        defaultCurrency,
        paymentMethods,
      });
    }
  }, [profileName, currencyFormat, defaultCurrency, paymentMethods, hydrated]);

  // Persist on change (skip until hydrated so we don't clobber stored data
  // with the default seed on the first render).
  useEffect(() => {
    if (hydrated) writeStoredPrefs(preferences);
  }, [preferences, hydrated]);

  useEffect(() => {
    if (hydrated) writeStoredRead(Array.from(readIds));
  }, [readIds, hydrated]);

  // ── Subscriptions (existing) ──
  const getById = useCallback(
    (id: string) => subscriptions.find((s) => s.id === id),
    [subscriptions],
  );

  const addSubscription = useCallback((data: SubscriptionInput) => {
    // TODO(backend): replace with real query / Server Action
    const now = new Date().toISOString();
    const sub: Subscription = {
      ...data,
      id: crypto.randomUUID(),
      user_id: "user-mock-1",
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    setSubscriptions((prev) => [sub, ...prev]);
  }, []);

  const updateSubscription = useCallback(
    (id: string, data: Partial<SubscriptionInput>) => {
      // TODO(backend): replace with real query / Server Action
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, ...data, updated_at: new Date().toISOString() }
            : s,
        ),
      );
    },
    [],
  );

  const deleteSubscription = useCallback(
    (id: string) => {
      // TODO(backend): replace with real query / Server Action
      // Soft delete: mark as "cancelled" (recently deleted) and timestamp
      // it so the retention window can purge it later. Reversible via
      // restoreSubscription.
      const now = new Date().toISOString();
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: "cancelled", deleted_at: now, updated_at: now }
            : s,
        ),
      );
    },
    [],
  );

  const restoreSubscription = useCallback((id: string) => {
    // TODO(backend): replace with real query / Server Action
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.is_trial ? "trial" : "active",
              deleted_at: null,
              updated_at: new Date().toISOString(),
            }
          : s,
      ),
    );
  }, []);

  // Purge soft-deleted subscriptions past the retention window on load.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSubscriptions((prev) => prev.filter((s) => !isExpiredDeleted(s)));
  }, []);

  // ── Profile / Settings mutators ──
  const addPaymentMethod = useCallback((method: string) => {
    const trimmed = method.trim();
    if (!trimmed) return;
    setPaymentMethods((prev) =>
      prev.some((m) => m.toLowerCase() === trimmed.toLowerCase())
        ? prev
        : [...prev, trimmed],
    );
  }, []);

  const removePaymentMethod = useCallback((method: string) => {
    setPaymentMethods((prev) => prev.filter((m) => m !== method));
  }, []);

  // ── Data management ──
  const exportData = useCallback((): string => {
    const payload = buildExportPayload({
      profileName,
      currencyFormat,
      defaultCurrency,
      paymentMethods,
      subscriptions,
      categories,
      preferences,
    });
    return exportDataAsJSON(payload);
  }, [
    profileName,
    currencyFormat,
    defaultCurrency,
    paymentMethods,
    subscriptions,
    categories,
    preferences,
  ]);

  const importData = useCallback((json: string): boolean => {
    const parsed = parseImportPayload(json);
    if (!parsed) return false;
    setSubscriptions(parsed.subscriptions);
    setCategories(parsed.categories);
    setPreferences(parsed.preferences);
    setProfileName(parsed.profileName);
    setCurrencyFormat(parsed.currencyFormat);
    setDefaultCurrency(parsed.defaultCurrency);
    setPaymentMethods(parsed.paymentMethods);
    return true;
  }, []);

  const resetData = useCallback(() => {
    resetAllData();
    setSubscriptions([]);
    setCategories(mockCategories);
    setPreferences(DEFAULT_REMINDER_PREFERENCES);
    setReadIds(new Set());
    setProfileName("");
    setCurrencyFormat("id");
    setDefaultCurrency("IDR");
    setPaymentMethods([...DEFAULT_PAYMENT_METHODS]);
  }, []);

  // ── Categories (new) ──
  const addCategory = useCallback((data: CategoryInput) => {
    // TODO(backend): replace with real Server Action
    const cat: Category = {
      id: `cat-${crypto.randomUUID()}`,
      user_id: "user-mock-1",
      name: data.name.trim(),
      icon: data.icon,
      color: data.color,
    };
    setCategories((prev) => [...prev, cat]);
  }, []);

  const updateCategory = useCallback(
    (id: string, data: Partial<CategoryInput>) => {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...(data.name !== undefined ? { name: data.name.trim() } : {}),
                ...(data.color !== undefined ? { color: data.color } : {}),
                ...(data.icon !== undefined ? { icon: data.icon } : {}),
              }
            : c,
        ),
      );
    },
    [],
  );

  const deleteCategory = useCallback((id: string) => {
    // Remove the category itself
    setCategories((prev) => prev.filter((c) => c.id !== id));
    // Move any subscription that was in this category to "uncategorized"
    // (category_id: null) so the data is preserved, just ungrouped.
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.category_id === id ? { ...s, category_id: null } : s,
      ),
    );
  }, []);

  // ── Notifications (new) ──
  const updateGlobalPreferences = useCallback((next: SubscriptionOverride) => {
    setPreferences((prev) => ({ ...prev, global: next }));
  }, []);

  const setSubscriptionOverride = useCallback(
    (subscriptionId: string, override: SubscriptionOverride | null) => {
      setPreferences((prev) => ({
        ...prev,
        perSubscription: {
          ...prev.perSubscription,
          [subscriptionId]: override,
        },
      }));
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Computed: full notification list + unread count. Pure derivation from
  // subscriptions + preferences + readIds. No effect needed.
  const rawNotifications: AppNotification[] = useMemo(
    () => generateNotifications(subscriptions, preferences, categories),
    [subscriptions, preferences, categories],
  );

  const visibleNotifications: AppNotification[] = useMemo(
    () =>
      rawNotifications.map((n) => ({
        ...n,
        read: readIds.has(n.id),
      })),
    [rawNotifications, readIds],
  );

  const unreadCount = useMemo(
    () => visibleNotifications.filter((n) => !n.read).length,
    [visibleNotifications],
  );

  // markAllAsRead that knows the current snapshot — exposed as a separate
  // helper that the dropdown uses (it can capture the current list).
  const markAllAsReadWithList = useCallback((list: AppNotification[]) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const n of list) next.add(n.id);
      return next;
    });
  }, []);

  return (
    <Ctx.Provider
      value={{
        subscriptions,
        categories,
        getById,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        restoreSubscription,
        profileName,
        setProfileName,
        currencyFormat,
        setCurrencyFormat,
        defaultCurrency,
        setDefaultCurrency,
        paymentMethods,
        addPaymentMethod,
        removePaymentMethod,
        exportData,
        importData,
        resetData,
        addCategory,
        updateCategory,
        deleteCategory,
        preferences,
        updateGlobalPreferences,
        setSubscriptionOverride,
        notifications: visibleNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead: markAllAsReadWithList,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSubscriptions() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useSubscriptions must be used within SubscriptionsProvider");
  return ctx;
}

// ── Convenience hooks for notification-specific use ──
export function useNotifications() {
  return useSubscriptions();
}
