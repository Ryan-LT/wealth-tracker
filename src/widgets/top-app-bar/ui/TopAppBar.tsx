"use client";

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
  metricLabel,
  metricValue,
  showActions = true,
  end,
  className,
}: TopAppBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 inset-x-0 z-40 box-border w-full min-w-0 max-w-full",
        "bg-surface border-b border-outline-variant",
        "pt-[env(safe-area-inset-top)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-14 min-h-14 w-full min-w-0 max-w-full items-center gap-2 sm:min-h-16 sm:gap-3 md:gap-4",
          // Horizontal safe area + align with page gutters (main uses px-margin-mobile / md:px-gutter).
          "ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))]",
          "md:ps-[max(1.5rem,env(safe-area-inset-left))] md:pe-[max(1.5rem,env(safe-area-inset-right))]",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-1 basis-0 items-center gap-2 sm:gap-4",
            "[&_h1]:min-w-0 [&_h1]:truncate [&_h2]:min-w-0 [&_h2]:truncate",
          )}
        >
          {start}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          {metricLabel ? (
            <div className="hidden max-w-[min(100%,14rem)] items-center gap-2 font-label-sm text-label-sm text-on-surface-variant lg:flex lg:max-w-[min(100%,18rem)]">
              <span className="shrink-0 uppercase tracking-wider">{metricLabel}</span>
              {metricValue ? (
                <span className="min-w-0 truncate font-data-tabular text-data-tabular font-bold text-primary">
                  {metricValue}
                </span>
              ) : null}
            </div>
          ) : null}

          {showActions ? (
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <IconButton icon="notifications" label="Notifications" />
              <IconButton icon="account_circle" label="Account" />
            </div>
          ) : null}

          {end}
        </div>
      </div>
    </header>
  );
}
