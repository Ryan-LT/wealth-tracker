"use client";

import { CloudOff } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { refetchTables, useLastSyncedAt } from "@/shared/storage/store";
import { cn } from "@/shared/lib";

const BANNER_HEIGHT = "1.75rem";
const HEIGHT_VAR = "--offline-banner-h";

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

  useEffect(() => {
    const root = document.documentElement;
    if (online) {
      root.style.removeProperty(HEIGHT_VAR);
    } else {
      root.style.setProperty(HEIGHT_VAR, BANNER_HEIGHT);
    }
    return () => {
      root.style.removeProperty(HEIGHT_VAR);
    };
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
      style={{ height: BANNER_HEIGHT }}
      className={cn(
        "fixed top-0 right-0 left-0 z-50 flex items-center justify-center gap-2",
        "border-b border-amber-500/30 bg-amber-500/15 px-4 text-xs",
        "text-amber-900 backdrop-blur-md dark:text-amber-200",
      )}
    >
      <CloudOff className="size-3.5" />
      <span>{label}</span>
    </div>
  );
}
