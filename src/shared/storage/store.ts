"use client";

import { useCallback, useSyncExternalStore } from "react";

import { TABLE_KEYS, type TableKey } from "./table-keys";

const tablesUrl = "/api/tables";

type Listener = () => void;

const listeners = new Set<Listener>();

/** In-memory table values (browser). Filled from Neon on hydrate; updated by writes. */
const valueCache = new Map<string, unknown>();

/** Keys changed since last successful persist (or waiting for first flush after hydrate). */
const dirty = new Set<string>();

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let hydrateState: "pending" | "ok" | "error" = "pending";
let hydratePromise: Promise<void> | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.fetch !== "undefined";
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  void ensureHydrated();
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  listeners.forEach((l) => l());
}

function ensureHydrated(): Promise<void> {
  if (!isBrowser()) {
    return Promise.resolve();
  }
  if (hydratePromise) {
    return hydratePromise;
  }
  hydratePromise = (async () => {
    try {
      const res = await fetch(tablesUrl);
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
    } catch {
      hydrateState = "error";
    } finally {
      notify();
      if (dirty.size > 0) {
        scheduleFlush();
      }
    }
  })();
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
  const tables: Record<string, unknown> = {};
  for (const k of dirty) {
    tables[k] = valueCache.get(k);
  }
  const keysToFlush = [...dirty];
  dirty.clear();
  try {
    const res = await fetch(tablesUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tables }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null) as { error?: string } | null;
      throw new Error(err?.error ?? `PUT ${tablesUrl} ${res.status}`);
    }
  } catch (e) {
    console.error("[wealthtracker] persist to Neon failed", e);
    for (const k of keysToFlush) {
      dirty.add(k);
    }
    scheduleFlush();
  }
}

function readSnapshot<T>(name: string, seed: T): T {
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
