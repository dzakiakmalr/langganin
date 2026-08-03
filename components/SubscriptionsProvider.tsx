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
import {
  type AppNotification,
  type ReminderPreferences,
  type SubscriptionOverride,
} from "@/types/notifications";
import { mockCategories, mockSubscriptions } from "@/lib/mock/subscriptions";
import {
  DEFAULT_REMINDER_PREFERENCES,
  generateNotifications,
} from "@/lib/utils/notifications";

// TODO(backend): replace with real query — see 06-API-CONTRACT.md
// The hook shape below is intentionally stable so consuming components
// won't need to change when the internals switch from in-memory state
// to Server Actions / Route Handlers.

export type SubscriptionInput = Omit<
  Subscription,
  "id" | "user_id" | "created_at" | "updated_at"
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

function readStoredPrefs(): ReminderPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.global &&
      Array.isArray(parsed.global.daysBefore) &&
      Array.isArray(parsed.global.channels) &&
      typeof parsed.perSubscription === "object"
    ) {
      return parsed as ReminderPreferences;
    }
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

  // Hydrate from localStorage on mount (avoids SSR/CSR mismatch).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = readStoredPrefs();
    if (stored) setPreferences(stored);
    const storedRead = readStoredRead();
    if (storedRead.length > 0) setReadIds(new Set(storedRead));
    setHydrated(true);
    // Mark hydration in a separate key so we can short-circuit writes
    // before the first effect runs.
    try {
      window.localStorage.setItem(STORAGE_HYDRATED, "1");
    } catch {
      // ignore
    }
  }, []);

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
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      // Also drop any per-subscription override for the deleted id.
      setPreferences((prev) => {
        if (!(id in prev.perSubscription)) return prev;
        const next = { ...prev.perSubscription };
        delete next[id];
        return { ...prev, perSubscription: next };
      });
      // Drop any read-state entries for that subscription.
      setReadIds((prev) => {
        const next = new Set<string>();
        for (const r of prev) {
          if (!r.startsWith(`${id}#`)) next.add(r);
        }
        return next;
      });
    },
    [],
  );

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
