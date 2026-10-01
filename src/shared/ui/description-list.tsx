import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export type DescriptionItem = {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  /** Bold total-style row. */
  emphasis?: boolean;
};

/** Label / value rows for breakdowns (right-aligned, tabular values). */
export function DescriptionList({ items, className }: { items: DescriptionItem[]; className?: string }) {
  return (
    <dl className={cn("divide-y text-sm", className)}>
      {items.map((item, i) => (
        <div key={i} className={cn("flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0", item.emphasis && "font-semibold")}>
          <dt className={cn("min-w-0", item.emphasis ? "text-foreground" : "text-muted-foreground")}>
            {item.label}
            {item.hint ? <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{item.hint}</span> : null}
          </dt>
          <dd className="shrink-0 text-right font-medium tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
