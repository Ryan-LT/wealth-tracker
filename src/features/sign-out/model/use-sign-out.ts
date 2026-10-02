"use client";

import { useCallback, useState } from "react";

import { clearTablesResponseCache } from "@/shared/lib/service-worker";
import { clearLocalTables, flushTablesNow } from "@/shared/storage/store";

/**
 * Flush pending edits, remove this account's data from the device, end the
 * session and load the login page fresh (no in-memory data survives).
 */
export function useSignOut() {
  const [pending, setPending] = useState(false);

  const signOut = useCallback(async () => {
    setPending(true);
    try {
      const synced = await flushTablesNow().catch(() => false);
      // Unsynced (offline) edits stay in this account's own device cache and
      // sync the next time it signs in here; otherwise leave nothing behind.
      if (synced) clearLocalTables();
      await clearTablesResponseCache();
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.replace("/login");
    } catch {
      setPending(false);
    }
  }, []);

  return { signOut, pending };
}
