"use client";

import { formatVnd } from "@/shared/lib";
import { Card, MaterialIcon } from "@/shared/ui";

type NetWorthCardProps = {
  totalNetWorth: number;
  monthChangePct: number;
};

export function NetWorthCard({ totalNetWorth, monthChangePct }: NetWorthCardProps) {
  const trendIcon =
    Math.abs(monthChangePct) < 0.05 ? "show_chart" : monthChangePct >= 0 ? "trending_up" : "trending_down";

  const trendClass =
    Math.abs(monthChangePct) < 0.05
      ? "text-on-surface-variant"
      : monthChangePct >= 0
        ? "text-secondary"
        : "text-error";

  return (
    <Card className="h-full border border-outline-variant/60 p-4">
      <div className="flex h-full min-h-0 flex-col justify-between gap-2">
        <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
          Net worth
        </h3>
        <p className="text-headline-md font-headline-md leading-tight tracking-tight text-primary tabular-nums">
          {formatVnd(totalNetWorth)}
        </p>
        <div className={`flex items-center gap-1 text-label-sm font-label-sm ${trendClass}`}>
          <MaterialIcon name={trendIcon} size={14} />
          <span className="font-data-tabular tabular-nums">
            {monthChangePct >= 0 ? "+" : ""}
            {monthChangePct.toFixed(1)}% MTD
          </span>
        </div>
      </div>
    </Card>
  );
}
