/**
 * Runs `callback` when the app returns to the foreground (PWA resume, tab focus,
 * or bfcache restore). Debounced so visibility + focus in the same tick coalesce.
 */
export function onAppForeground(
  callback: () => void,
  debounceMs = 150,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let debounceId: ReturnType<typeof setTimeout> | null = null;

  const schedule = () => {
    if (document.visibilityState !== "visible") return;
    if (debounceId) clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      debounceId = null;
      callback();
    }, debounceMs);
  };

  const onPageShow = (event: PageTransitionEvent) => {
    if (event.persisted) schedule();
  };

  document.addEventListener("visibilitychange", schedule);
  window.addEventListener("focus", schedule);
  window.addEventListener("pageshow", onPageShow);

  return () => {
    if (debounceId) clearTimeout(debounceId);
    document.removeEventListener("visibilitychange", schedule);
    window.removeEventListener("focus", schedule);
    window.removeEventListener("pageshow", onPageShow);
  };
}
