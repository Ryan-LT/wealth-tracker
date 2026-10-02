import { CloudOff, RotateCw } from "lucide-react";

import { Button } from "@/shared/ui/kit/button";

type AppErrorScreenProps = {
  onRetry: () => void;
};

/**
 * Shown in the content area when the very first load fails and there is no
 * offline copy. Rendering pages with empty seed data here could overwrite real
 * data on the next save, so pages wait; navigation keeps working.
 */
export function AppErrorScreen({ onRetry }: AppErrorScreenProps) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-5 px-6 py-12 text-center" role="alert">
      <div className="flex max-w-sm flex-col items-center gap-2">
        <CloudOff className="size-6 text-muted-foreground" aria-hidden />
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
