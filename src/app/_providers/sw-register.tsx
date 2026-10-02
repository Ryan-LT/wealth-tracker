"use client";

import { useEffect } from "react";

import { CACHE_SHELL_ROUTES_MESSAGE } from "@/app/sw-routes";
import { checkForServiceWorkerUpdate } from "@/shared/lib/service-worker";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    void checkForServiceWorkerUpdate();
  }, []);

  return null;
}

/** Mounted in the signed-in shell so every app route gets cached for offline use. */
export function OfflineShellWarmup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.ready.then((registration) =>
      registration.active?.postMessage({ type: CACHE_SHELL_ROUTES_MESSAGE }),
    );
  }, []);

  return null;
}
