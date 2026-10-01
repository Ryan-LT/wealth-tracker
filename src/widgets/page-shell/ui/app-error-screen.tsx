import { CloudOff, RotateCw } from "lucide-react";

import { Button } from "@/shared/ui/kit/button";
import { WealthTrackerLogo } from "@/shared/ui/wealth-tracker-logo";

type AppErrorScreenProps = {
  onRetry: () => void;
};

/**
 * Shown when the very first load fails and there is no offline copy. Rendering
 * pages with empty seed data here could overwrite real data on the next save.
 */
export function AppErrorScreen({ onRetry }: AppErrorScreenProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background px-6 text-center"
      role="alert"
    >
      <WealthTrackerLogo size={48} />
      <div className="flex max-w-sm flex-col items-center gap-2">
        <CloudOff className="size-5 text-muted-foreground" aria-hidden />
        <p className="text-base font-semibold">Couldn&apos;t load your data</p>
        <p className="text-sm text-muted-foreground">
          The server didn&apos;t respond and there is no offline copy on this device yet.
          Nothing has been changed.
        </p>
      </div>
      <Button onClick={onRetry}>
        <RotateCw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
