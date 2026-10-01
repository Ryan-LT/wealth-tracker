import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { formatPercent } from "@/shared/lib/format";

export type BarListItem = { key: string; label: ReactNode; value: number; valueLabel: ReactNode; share: number };

/**
 * Horizontal magnitude bars (single hue). Each row carries its value and share as
 * text, so nothing depends on hovering.
 */
export function BarList({ items, className }: { items: BarListItem[]; className?: string }) {
  const max = Math.max(...items.map((i) => i.value), 0);
  return (
    <ul className={cn("grid gap-3", className)}>
      {items.map((item) => (
        <li key={item.key} className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{item.label}</span>
            <span className="shrink-0 tabular-nums">
              <span className="font-medium">{item.valueLabel}</span>
              <span className="ml-2 inline-block w-10 text-right text-xs text-muted-foreground">
                {formatPercent(item.share * 100, { maximumFractionDigits: 0 })}
              </span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-border/60" aria-hidden>
            <div
              className="h-full rounded-r-full bg-chart-1"
              style={{ width: `${max > 0 ? Math.max(1.5, (item.value / max) * 100) : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
