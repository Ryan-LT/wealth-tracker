"use client";

import { useEffect, useState, type ReactNode } from "react";

import { checkForServiceWorkerUpdate } from "@/components/sw-register";
import { onAppForeground } from "@/shared/lib/app-foreground";
import { refetchTables, useHydrated } from "@/shared/storage";

import { AppLoadingScreen } from "./app-loading-screen";

function runBootstrap(): Promise<void> {
  return Promise.all([refetchTables(), checkForServiceWorkerUpdate()]).then(() => undefined);
}

/**
 * Blocks the shell until the latest service worker (if any) and Neon tables
 * have been fetched for this open. Shows a full-screen loader during sync and
 * again when the PWA returns to the foreground.
 */
export function HydrationGate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const [swChecked, setSwChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void runBootstrap().finally(() => {
      if (!cancelled) setSwChecked(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return onAppForeground(() => {
      setSwChecked(false);
      void runBootstrap().finally(() => setSwChecked(true));
    });
  }, []);

  if (!swChecked || !hydrated) {
    return <AppLoadingScreen />;
  }

  return <>{children}</>;
}
