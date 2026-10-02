/** App routes pre-cached by the service worker so every page opens offline. */
export const SHELL_ROUTES = [
  "/",
  "/goals",
  "/allocations",
  "/assets",
  "/income",
  "/debts",
  "/loans",
  "/settings",
] as const;

/** Client → worker message: cache any shell route missing from the offline cache. */
export const CACHE_SHELL_ROUTES_MESSAGE = "CACHE_SHELL_ROUTES";
