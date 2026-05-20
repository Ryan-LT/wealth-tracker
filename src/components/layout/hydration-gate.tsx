"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { WealthTrackerLogo } from "@/shared/ui/wealth-tracker-logo";
import { useHydrated } from "@/shared/storage";

export function HydrationGate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="flex h-svh w-full flex-col items-center justify-center gap-4">
        <WealthTrackerLogo size={48} />
        <div className="text-muted-foreground inline-flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
