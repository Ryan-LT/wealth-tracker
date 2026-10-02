"use client";

import { cn } from "@/shared/lib/cn";
import { useSyncing } from "@/shared/storage";

import { useNavigationPending } from "../model/navigation";

/**
 * The app's single loading signal once it is open: a thin bar under the top
 * bar while a page change or a background sync is running. It fades in only
 * after a short delay, so instant changes show nothing at all.
 */
export function NavigationProgress() {
  const navigating = useNavigationPending();
  const syncing = useSyncing();
  const active = navigating || syncing;

  return (
    <div
      aria-hidden
      data-active={active || undefined}
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 translate-y-full overflow-hidden opacity-0",
        active && "animate-progress-in",
      )}
    >
      <div className="h-full w-2/5 rounded-full bg-primary motion-safe:animate-progress-slide" />
    </div>
  );
}
