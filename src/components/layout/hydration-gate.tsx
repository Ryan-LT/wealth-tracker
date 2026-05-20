"use client";

import type { ReactNode } from "react";

/**
 * Pass-through. Previously this rendered a full-screen spinner until the Neon
 * fetch resolved, which meant the whole shell waited on a network round-trip
 * even when the local cache already had data. Pages now own their own
 * skeleton placeholders via `useHydrated()`, so the gate just renders its
 * children immediately.
 */
export function HydrationGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
