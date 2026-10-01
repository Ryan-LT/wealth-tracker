"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { backgroundRefetchTables, flushTablesNow } from "@/shared/storage/store";

/** Push pending edits, then pull the latest tables — without the full-screen loader. */
export function useSyncNow() {
  const [syncing, setSyncing] = useState(false);

  const syncNow = useCallback(async () => {
    setSyncing(true);
    try {
      const pushed = await flushTablesNow();
      if (!pushed) {
        toast.error("Couldn't reach the server", {
          description: "Your changes are saved on this device and will sync automatically.",
        });
        return;
      }
      await backgroundRefetchTables();
      toast.success("Synced with the server");
    } finally {
      setSyncing(false);
    }
  }, []);

  return { syncNow, syncing };
}
