import { Loader2 } from "lucide-react";

import { WealthTrackerLogo } from "@/shared/ui/wealth-tracker-logo";

type AppLoadingScreenProps = {
  message?: string;
};

export function AppLoadingScreen({
  message = "Loading latest data…",
}: AppLoadingScreenProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <WealthTrackerLogo size={48} />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        <span>{message}</span>
      </div>
    </div>
  );
}
