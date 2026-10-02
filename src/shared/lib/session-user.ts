import { useSyncExternalStore } from "react";

/** Readable cookie set at login next to the HttpOnly session (see `auth-session.ts`). */
const USER_COOKIE = "wt_user";

export type SessionUser = { id: string; name: string };

let cachedRaw: string | null = null;
let cachedUser: SessionUser | null = null;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  for (const part of document.cookie.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

function decode(raw: string): SessionUser | null {
  try {
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4)), (c) => c.charCodeAt(0));
    const { id, name } = JSON.parse(new TextDecoder().decode(bytes)) as { id?: unknown; name?: unknown };
    if (typeof id !== "string" || !id) return null;
    return { id, name: typeof name === "string" ? name : "" };
  } catch {
    return null;
  }
}

/**
 * The signed-in account on this device, or `null` when signed out or login is
 * disabled. For display and per-account caches only: the server never trusts it.
 */
export function readSessionUser(): SessionUser | null {
  const raw = readCookie(USER_COOKIE);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = raw ? decode(raw) : null;
  }
  return cachedUser;
}

// The cookie only changes on sign-in / sign-out, which reload the page.
const subscribe = () => () => {};

/** {@link readSessionUser} as a hook; `null` during server rendering. */
export function useSessionUser(): SessionUser | null {
  return useSyncExternalStore(subscribe, readSessionUser, () => null);
}
