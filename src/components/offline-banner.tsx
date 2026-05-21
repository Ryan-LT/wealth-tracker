"use client";

import { CloudOff } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { refetchTables, useLastSyncedAt } from "@/shared/storage/store";
import { cn } from "@/shared/lib";

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function subscribeOnline(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function useOnline(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

export function OfflineBanner() {
  const online = useOnline();
  const lastSyncedAt = useLastSyncedAt();
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (online && wasOfflineRef.current) {
      void refetchTables();
    }
    wasOfflineRef.current = !online;
  }, [online]);

  if (online) return null;

  const label =
    lastSyncedAt != null
      ? `Offline — last synced at ${formatTime(lastSyncedAt)}`
      : "Offline — showing locally saved data";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "sticky top-0 z-30 flex items-center justify-center gap-2 border-b",
        "border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs",
        "text-amber-900 dark:text-amber-200",
      )}
    >
      <CloudOff className="size-3.5" />
      <span>{label}</span>
    </div>
  );
}
