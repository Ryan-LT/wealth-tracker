"use client";

import { usePathname } from "next/navigation";

import { LOCALES } from "@/shared/i18n/locale";

const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join("|")})(?=/|$)`);

/** `/vi/goals` → `/goals`; `/en` → `/`. */
export function stripLocale(pathname: string): string {
  return pathname.replace(LOCALE_PREFIX, "") || "/";
}

/**
 * The app path without the language segment. Pages are prerendered at
 * `/en/goals` / `/vi/goals` but served at `/goals` (proxy rewrite), so the raw
 * `usePathname()` differs between the server render and the browser — use
 * this everywhere the path decides what renders.
 */
export function useAppPathname(): string {
  return stripLocale(usePathname() ?? "/");
}
