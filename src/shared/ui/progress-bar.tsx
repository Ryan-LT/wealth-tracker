"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  max?: number;
  tone?: "secondary" | "error";
  className?: string;
};

export function ProgressBar({
  value,
  max = 100,
  tone = "secondary",
  className,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <Progress
      value={pct}
      className={cn(
        "h-2",
        tone === "error" && "*:data-[slot=progress-indicator]:bg-destructive",
        className,
      )}
    />
  );
}
