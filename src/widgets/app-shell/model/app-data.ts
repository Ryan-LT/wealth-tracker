"use client";

import { useEffect } from "react";

import { onAppForeground } from "@/shared/lib/app-foreground";
import { checkForServiceWorkerUpdate } from "@/shared/lib/service-worker";
import { backgroundRefetchTables, refetchTables, useHasLocalData, useHydrated, useInitialLoadDone } from "@/shared/storage";

export type AppDataState = "ready" | "loading" | "error";

/**
 * Whether pages may render:
 * - "ready": there is real data (from the server or this device's cache),
 * - "loading": nothing cached yet and the first fetch is running,
 * - "error": that first fetch failed and nothing is cached.
 *
 * Pages must not render until "ready": with only seed data, the next save
 * would overwrite the real tables. The shell itself stays usable throughout.
 */
export function useAppDataState(): AppDataState {
  const hydrated = useHydrated();
  const initialLoadDone = useInitialLoadDone();
  const hasLocalData = useHasLocalData();
  if (initialLoadDone || hasLocalData) return "ready";
  return hydrated ? "error" : "loading";
}

export function retryInitialLoad(): void {
  void refetchTables();
}

/** Background upkeep: service-worker updates on open, and a resync whenever the app returns to the foreground. */
export function useAppSync(state: AppDataState): void {
  useEffect(() => {
    void checkForServiceWorkerUpdate();
  }, []);

  useEffect(() => {
    return onAppForeground(() => {
      if (state === "ready") void backgroundRefetchTables();
      else void refetchTables();
      void checkForServiceWorkerUpdate();
    });
  }, [state]);
}
