"use client";

import { CloudOff, RotateCw } from "lucide-react";

import { useI18n } from "@/shared/i18n";
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
  const { t } = useI18n();
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-5 px-6 py-12 text-center" role="alert">
      <div className="flex max-w-sm flex-col items-center gap-2">
        <CloudOff className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-base font-semibold">{t.shell.loadError.title}</p>
        <p className="text-sm text-muted-foreground">{t.shell.loadError.body}</p>
      </div>
      <Button onClick={onRetry}>
        <RotateCw className="size-4" />
        {t.shell.loadError.retry}
      </Button>
    </div>
  );
}
