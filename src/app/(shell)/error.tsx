"use client";

import { RotateCw } from "lucide-react";

import { Button } from "@/shared/ui/kit/button";
import { EmptyState } from "@/shared/ui/empty-state";

export default function ShellError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <EmptyState
      className="min-h-[60vh]"
      title="This page hit an error"
      description={error.message || "Something went wrong while rendering this page. Your data is safe."}
      action={
        <Button onClick={() => unstable_retry()}>
          <RotateCw />
          Try again
        </Button>
      }
    />
  );
}
