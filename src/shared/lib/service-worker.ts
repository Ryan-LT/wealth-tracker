let reloadListenerAttached = false;
let updateReady = false;

function hasOpenDialog(): boolean {
  return document.querySelector('[role="dialog"], [role="alertdialog"]') !== null;
}

/** Reload into the new version at a moment the user won't notice. */
function reloadWhenIdle(): void {
  if (document.visibilityState === "hidden" && !hasOpenDialog()) {
    window.location.reload();
    return;
  }
  const onVisibility = () => {
    if (document.visibilityState === "hidden" && !hasOpenDialog()) window.location.reload();
  };
  document.addEventListener("visibilitychange", onVisibility);
}

function attachReloadOnControllerChange(): void {
  if (reloadListenerAttached || typeof navigator === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  reloadListenerAttached = true;
  // A first install only starts controlling the page; nothing stale to replace.
  let hadController = navigator.serviceWorker.controller !== null;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController) {
      // Never reload mid-use: wait until the app is in the background, or
      // until the next page change (see `isServiceWorkerUpdateReady`).
      updateReady = true;
      reloadWhenIdle();
    }
    hadController = true;
  });
}

/** A new app version took over; the next navigation should load it fresh. */
export function isServiceWorkerUpdateReady(): boolean {
  return updateReady;
}

/**
 * Registers the service worker, checks for an update, and waits briefly for
 * `skipWaiting` activation. Runs in the background; never blocks rendering.
 */
export async function checkForServiceWorkerUpdate(): Promise<void> {
  if (process.env.NODE_ENV !== "production") return;
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  attachReloadOnControllerChange();

  const registration = await navigator.serviceWorker
    .register("/sw.js", { scope: "/", updateViaCache: "none" })
    .catch(() => null);
  if (!registration) return;

  // Fails offline; the next foreground check tries again.
  await registration.update().catch(() => undefined);

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
