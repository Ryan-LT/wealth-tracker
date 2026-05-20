import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { ExpirationPlugin, Serwist, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Override the default `/api/*` NetworkFirst handler with StaleWhileRevalidate for
 * the read-only endpoints the dashboard depends on. This makes repeat visits
 * paint immediately from cache while the network revalidates in the background.
 */
const apiCaching: RuntimeCaching[] = [
  {
    matcher: ({ sameOrigin, url: { pathname }, request }) =>
      sameOrigin && request.method === "GET" && pathname === "/api/tables",
    method: "GET",
    handler: new StaleWhileRevalidate({
      cacheName: "wealthtracker-tables",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 4,
          maxAgeSeconds: 60 * 60 * 24 * 7,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    matcher: ({ sameOrigin, url: { pathname }, request }) =>
      sameOrigin &&
      request.method === "GET" &&
      pathname.startsWith("/api/finance/"),
    method: "GET",
    handler: new StaleWhileRevalidate({
      cacheName: "wealthtracker-finance",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 16,
          maxAgeSeconds: 60 * 60 * 24,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...apiCaching, ...defaultCache],
});

serwist.addEventListeners();
