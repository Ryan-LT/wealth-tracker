"use client";

import { useCallback, useSyncExternalStore } from "react";

const NS = "wt:v1:";

type Listener = () => void;

const listeners = new Set<Listener>();
/** Cache the parsed value per table to keep `getSnapshot` referentially stable
 *  (required by `useSyncExternalStore` to avoid infinite render loops). */
const valueCache = new Map<string, unknown>();
/** Last raw JSON string we parsed from localStorage, keyed by table name. */
const rawCache = new Map<string, string | null>();

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  listeners.forEach((l) => l());
}

function readSnapshot<T>(name: string, seed: T): T {
  if (!isBrowser()) return seed;
  try {
    const raw = window.localStorage.getItem(NS + name);
    const lastRaw = rawCache.get(name);
    if (lastRaw === raw && valueCache.has(name)) {
      return valueCache.get(name) as T;
    }
    rawCache.set(name, raw);
    if (raw === null) {
      valueCache.set(name, seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as T;
    valueCache.set(name, parsed);
    return parsed;
  } catch {
    return seed;
  }
}

export function readTable<T>(name: string, seed: T): T {
  return readSnapshot(name, seed);
}

export function writeTable<T>(name: string, value: T): void {
  if (!isBrowser()) return;
  try {
    const raw = JSON.stringify(value);
    window.localStorage.setItem(NS + name, raw);
    rawCache.set(name, raw);
    valueCache.set(name, value);
    notify();
  } catch {
    // Quota or serialization failure — surface caches still hold the value.
  }
}

/**
 * SSR-safe table hook backed by localStorage.
 *
 * Returns `[value, update, hydrated]` so that view code remains
 * source-compatible with the previous `useState`-based implementation. The
 * `hydrated` flag is always `true` here because `useSyncExternalStore`
 * provides hydration-safe values from the start (the server-side render uses
 * `getServerSnapshot`, which always returns the seed, and the post-hydration
 * client render swaps in the localStorage value transparently).
 */
export function useTable<T>(name: string, seed: T) {
  const getSnapshot = useCallback(() => readSnapshot(name, seed), [name, seed]);
  const getServerSnapshot = useCallback(() => seed, [seed]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = readSnapshot(name, seed);
      const computed =
        typeof next === "function" ? (next as (prev: T) => T)(current) : next;
      writeTable(name, computed);
    },
    [name, seed],
  );

  return [value, update, true] as const;
}
