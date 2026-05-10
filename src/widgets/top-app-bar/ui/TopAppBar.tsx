import type { ReactNode } from "react";

import { cn } from "@/shared/lib";
import { IconButton } from "@/shared/ui";

type TopAppBarProps = {
  /** Left-aligned slot — typically a page title or search field. */
  start?: ReactNode;
  /**
   * Optional textual metric shown next to the action icons,
   * e.g. "Metric: Net Worth".
   */
  metricLabel?: string;
  /** Optional bold metric value rendered after the label. */
  metricValue?: ReactNode;
  /** Show the right-side notification + account icons. Defaults to true. */
  showActions?: boolean;
  /** Optional extra trailing slot (e.g. an avatar image). */
  end?: ReactNode;
  className?: string;
};

export function TopAppBar({
  start,
  metricLabel = "Metric: Net Worth",
  metricValue,
  showActions = true,
  end,
  className,
}: TopAppBarProps) {
  return (
    <header
      className={cn(
        "bg-surface h-16 w-full sticky top-0 z-40",
        "border-b border-outline-variant",
        "flex justify-between items-center px-gutter",
        className,
      )}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">{start}</div>

      <div className="flex items-center gap-stack-md shrink-0">
        {metricLabel ? (
          <div className="hidden lg:flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <span className="uppercase tracking-wider">{metricLabel}</span>
            {metricValue ? (
              <span className="font-data-tabular text-data-tabular text-primary font-bold">
                {metricValue}
              </span>
            ) : null}
          </div>
        ) : null}

        {showActions ? (
          <div className="flex items-center gap-stack-sm">
            <IconButton icon="notifications" label="Notifications" />
            <IconButton icon="account_circle" label="Account" />
          </div>
        ) : null}

        {end}
      </div>
    </header>
  );
}
