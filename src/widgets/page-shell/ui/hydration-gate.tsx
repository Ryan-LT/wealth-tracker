"use client";

import { useEffect, useState, type ReactNode } from "react";

import { checkForServiceWorkerUpdate } from "@/components/sw-register";
import { onAppForeground } from "@/shared/lib/app-foreground";
import {
  backgroundRefetchTables,
  refetchTables,
  useHydrated,
  useInitialLoadDone,
} from "@/shared/storage";

import { AppLoadingScreen } from "./app-loading-screen";

function runBootstrap(): Promise<void> {
  return Promise.all([refetchTables(), checkForServiceWorkerUpdate()]).then(() => undefined);
}

function runBackgroundSync(): Promise<void> {
  return Promise.all([backgroundRefetchTables(), checkForServiceWorkerUpdate()]).then(
    () => undefined,
  );
}

/**
 * Blocks the shell until the latest service worker (if any) and Neon tables
 * have been fetched for this open. Shows a full-screen loader only on the
 * first sync; subsequent foreground resumes sync in the background.
 */
export function HydrationGate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const initialLoadDone = useInitialLoadDone();
  const [bootstrapPending, setBootstrapPending] = useState(!initialLoadDone);

  useEffect(() => {
    if (initialLoadDone) {
      return;
    }

    let cancelled = false;

    void runBootstrap().finally(() => {
      if (!cancelled) setBootstrapPending(false);
    });

    return () => {
      cancelled = true;
    };
  }, [initialLoadDone]);

  useEffect(() => {
    return onAppForeground(() => {
      if (initialLoadDone) {
        void runBackgroundSync();
      } else {
        setBootstrapPending(true);
        void runBootstrap().finally(() => setBootstrapPending(false));
      }
    });
  }, [initialLoadDone]);

  if (!initialLoadDone && (bootstrapPending || !hydrated)) {
    return <AppLoadingScreen />;
  }

  return <>{children}</>;
}
