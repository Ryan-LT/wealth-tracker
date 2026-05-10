import { cn } from "@/shared/lib";

type ProgressBarProps = {
  value: number;
  /** Defaults to 100. */
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
    <div className={cn("w-full bg-surface-container-highest rounded-full h-2", className)}>
      <div
        className={cn(
          "h-2 rounded-full transition-[width] duration-300",
          tone === "secondary" ? "bg-secondary" : "bg-error",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
