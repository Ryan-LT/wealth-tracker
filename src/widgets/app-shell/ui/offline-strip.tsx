"use client";

import { CloudOff } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { useI18n } from "@/shared/i18n";
import { formatTime } from "@/shared/lib/format";
import { backgroundRefetchTables, useLastSyncedAt } from "@/shared/storage/store";

function subscribeOnline(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}

/** Thin strip inside the sticky top bar while offline; resyncs when back online. */
export function OfflineStrip() {
  const online = useOnline();
  const { t } = useI18n();
  const lastSyncedAt = useLastSyncedAt();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (online && wasOffline.current) void backgroundRefetchTables();
    wasOffline.current = !online;
  }, [online]);

  if (online) return null;
  return (
    <div role="status" aria-live="polite" className="flex h-7 items-center justify-center gap-2 bg-warning-muted px-4 text-xs font-medium text-foreground">
      <CloudOff className="size-3.5 text-warning" aria-hidden />
      {lastSyncedAt != null
        ? t.shell.offline.since({ time: formatTime(lastSyncedAt) })
        : t.shell.offline.local}
    </div>
  );
}
