"use client";

import { RotateCw } from "lucide-react";

import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui/kit/button";
import { EmptyState } from "@/shared/ui/empty-state";

export default function ShellError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const { t } = useI18n();
  return (
    <EmptyState
      className="min-h-[60vh]"
      title={t.auth.pageError.title}
      description={error.message || t.auth.pageError.fallback}
      action={
        <Button onClick={() => unstable_retry()}>
          <RotateCw />
          {t.auth.pageError.retry}
        </Button>
      }
    />
  );
}
