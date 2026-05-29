"use client";

import { useEffect } from "react";

import { onAppForeground } from "@/shared/lib/app-foreground";
import { refetchTables } from "@/shared/storage/store";

/** Re-sync Neon tables when the PWA or tab returns to the foreground. */
export function ForegroundSync() {
  useEffect(() => {
    return onAppForeground(() => {
      void refetchTables();
    });
  }, []);

  return null;
}
