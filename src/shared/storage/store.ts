"use client";

import { useCallback, useSyncExternalStore } from "react";

import { TABLE_KEYS, type TableKey } from "./table-keys";

const tablesUrl = "/api/tables";
const LOCAL_CACHE_KEY = "wealthtracker:tables:v1";

type Listener = () => void;

const listeners = new Set<Listener>();

/** In-memory table values (browser). Filled from Neon on hydrate; updated by writes. */
const valueCache = new Map<string, unknown>();

/** Keys changed since last successful persist (or waiting for first flush after hydrate). */
const dirty = new Set<string>();

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushInFlight: Promise<void> | null = null;
let hydrateState: "pending" | "ok" | "error" = "pending";
let hydratePromise: Promise<void> | null = null;
let syncInFlight: Promise<void> | null = null;
let localCacheLoaded = false;
let lastSyncedAt: number | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.fetch !== "undefined";
}

type StoredShape = {
  tables?: Partial<Record<TableKey, unknown>>;
  lastSyncedAt?: number | null;
};

function loadLocalCache(): void {
  if (localCacheLoaded) return;
  localCacheLoaded = true;
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as StoredShape & Partial<Record<TableKey, unknown>>;
    if (!parsed || typeof parsed !== "object") return;
    // Detect shape: new envelope has a `tables` object; legacy stored table keys directly.
    const tables =
      parsed.tables && typeof parsed.tables === "object" && !Array.isArray(parsed.tables)
        ? parsed.tables
        : (parsed as Partial<Record<TableKey, unknown>>);
    for (const key of TABLE_KEYS) {
      if (tables[key] !== undefined) {
        valueCache.set(key, tables[key]);
      }
    }
    if (typeof parsed.lastSyncedAt === "number") {
      lastSyncedAt = parsed.lastSyncedAt;
    }
  } catch {
    // Corrupt cache — ignore.
  }
}

function persistLocalCache(): void {
  if (!isBrowser()) return;
  try {
    const tables: Record<string, unknown> = {};
    for (const key of TABLE_KEYS) {
      if (valueCache.has(key)) {
        tables[key] = valueCache.get(key);
      }
    }
    const envelope: StoredShape = { tables, lastSyncedAt };
    window.localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(envelope));
  } catch {
    // Quota or serialization error — non-fatal.
  }
}

function subscribe(listener: Listener): () => void {
  loadLocalCache();
  listeners.add(listener);
  void ensureHydrated();
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  listeners.forEach((l) => l());
}

function syncFromServer(): Promise<void> {
  if (!isBrowser()) {
    return Promise.resolve();
  }
  if (syncInFlight) {
    return syncInFlight;
  }
  syncInFlight = (async () => {
    try {
      const res = await fetch(tablesUrl, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`GET ${tablesUrl} ${res.status}`);
      }
      const data = (await res.json()) as { tables?: Partial<Record<TableKey, unknown>> };
      const remote = data.tables ?? {};
      for (const key of TABLE_KEYS) {
        if (dirty.has(key)) {
          continue;
        }
        if (remote[key] !== undefined) {
          valueCache.set(key, remote[key]);
        }
      }
      hydrateState = "ok";
      lastSyncedAt = Date.now();
      persistLocalCache();
    } catch {
      if (valueCache.size > 0) {
        hydrateState = "ok";
      } else if (hydrateState === "pending") {
        hydrateState = "error";
      }
    } finally {
      notify();
      if (dirty.size > 0) {
        scheduleFlush();
      }
    }
  })().finally(() => {
    syncInFlight = null;
  });
  return syncInFlight;
}

function ensureHydrated(): Promise<void> {
  if (!isBrowser()) {
    return Promise.resolve();
  }
  if (hydratePromise) {
    return hydratePromise;
  }
  hydratePromise = syncFromServer();
  return hydratePromise;
}

function scheduleFlush(): void {
  if (!isBrowser()) {
    return;
  }
  if (flushTimer) {
    clearTimeout(flushTimer);
  }
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushDirty();
  }, 400);
}

async function flushDirty(): Promise<void> {
  if (dirty.size === 0) {
    return;
  }
  if (flushInFlight) {
    return flushInFlight;
  }

  const keysToFlush = [...dirty];
  const tables: Record<string, unknown> = {};
  for (const k of keysToFlush) {
    tables[k] = valueCache.get(k);
  }

  flushInFlight = (async () => {
    try {
      const res = await fetch(tablesUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables }),
        cache: "no-store",
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? `PUT ${tablesUrl} ${res.status}`);
      }
      for (const k of keysToFlush) {
        dirty.delete(k);
      }
    } catch (e) {
      console.error("[wealthtracker] persist to Neon failed", e);
      scheduleFlush();
    } finally {
      flushInFlight = null;
      if (dirty.size > 0) {
        scheduleFlush();
      }
    }
  })();

  return flushInFlight;
}

/** Wait for any pending debounced writes to reach the server. */
export async function flushTablesNow(): Promise<void> {
  if (!isBrowser()) return;
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  while (dirty.size > 0) {
    await flushDirty();
  }
}

function readSnapshot<T>(name: string, seed: T): T {
  loadLocalCache();
  if (valueCache.has(name)) {
    return valueCache.get(name) as T;
  }
  return seed;
}

export function readTable<T>(name: string, seed: T): T {
  return readSnapshot(name, seed);
}

export function writeTable<T>(name: string, value: T): void {
  if (!isBrowser()) {
    return;
  }
  valueCache.set(name, value);
  dirty.add(name);
  persistLocalCache();
  notify();
  scheduleFlush();
}

/**
 * SSR-safe table hook backed by Neon (via `/api/tables`).
 *
 * Hydrates from Postgres on first client subscribe; updates debounce-save to Neon.
 * The third flag is `hydrated`: `false` until the initial load attempt finishes.
 */
export function useTable<T>(name: string, seed: T) {
  const getSnapshot = useCallback(() => readSnapshot(name, seed), [name, seed]);
  const getServerSnapshot = useCallback(() => seed, [seed]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const loadFinished = useSyncExternalStore(
    subscribe,
    () => hydrateState !== "pending",
    () => false,
  );

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = readSnapshot(name, seed);
      const computed =
        typeof next === "function" ? (next as (prev: T) => T)(current) : next;
      writeTable(name, computed);
    },
    [name, seed],
  );

  return [value, update, loadFinished] as const;
}

/**
 * Global hydration flag. `false` until the current Neon fetch resolves (success,
 * offline cache fallback, or error). Returns `false` again while a foreground
 * re-sync is in flight.
 *
 * Mounting this hook also kicks off hydration, so it can gate the first
 * render before any `useTable` subscribes.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hydrateState !== "pending",
    () => false,
  );
}

/**
 * Last successful hydrate-from-server timestamp (epoch ms). `null` until the
 * first network sync completes. Restored from localStorage on cold start.
 */
export function useLastSyncedAt(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => lastSyncedAt,
    () => null,
  );
}

/**
 * Force a re-fetch from Neon. Resets hydration until the request finishes so the
 * shell can show a loading screen. Safe to call on every foreground resume.
 */
export function refetchTables(): Promise<void> {
  if (!isBrowser()) {
    return Promise.resolve();
  }
  hydrateState = "pending";
  hydratePromise = null;
  syncInFlight = null;
  notify();
  return syncFromServer();
}
