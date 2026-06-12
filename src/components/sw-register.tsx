"use client";

import { useEffect } from "react";

let reloadListenerAttached = false;

function attachReloadOnControllerChange(): void {
  if (reloadListenerAttached || typeof navigator === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  reloadListenerAttached = true;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

/**
 * Registers the service worker, checks for an update, and waits briefly for
 * `skipWaiting` activation. If a new worker takes control, the page reloads.
 */
export async function checkForServiceWorkerUpdate(): Promise<void> {
  if (process.env.NODE_ENV !== "production") return;
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  attachReloadOnControllerChange();

  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });

  await registration.update();

  const worker = registration.installing ?? registration.waiting;
  if (!worker) return;

  await new Promise<void>((resolve) => {
    const timeout = window.setTimeout(resolve, 4_000);
    worker.addEventListener(
      "statechange",
      () => {
        if (worker.state === "activated" || worker.state === "redundant") {
          window.clearTimeout(timeout);
          resolve();
        }
      },
      { once: true },
    );
  });
}

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    void checkForServiceWorkerUpdate();
  }, []);

  return null;
}
