"use client";

import { formatVnd } from "@/shared/lib";
import { Badge, Card, MaterialIcon } from "@/shared/ui";

type FeasibilityEngineProps = {
  monthlyIncome: number;
  startingBalance: number;
  projectedBalanceAtTarget: number;
  targetAmount: number;
  monthsToTarget: number;
  note?: string;
};

export function FeasibilityEngine({
  monthlyIncome,
  startingBalance,
  projectedBalanceAtTarget,
  targetAmount,
  monthsToTarget,
  note,
}: FeasibilityEngineProps) {
  const onTrack =
    targetAmount > 0 &&
    projectedBalanceAtTarget >= targetAmount &&
    monthsToTarget >= 1;

  return (
    <Card className="p-stack-md">
      <div className="flex items-center justify-between border-b border-outline-variant pb-2 mb-4">
        <h3 className="text-headline-md font-headline-md text-on-surface">Feasibility</h3>
        <MaterialIcon
          name={targetAmount <= 0 ? "help_outline" : onTrack ? "check_circle" : "error"}
          className={
            targetAmount <= 0
              ? "text-on-surface-variant"
              : onTrack
                ? "text-secondary"
                : "text-error"
          }
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2">
          <span className="text-body-md font-body-md text-on-surface-variant">Status</span>
          <Badge tone="active">{targetAmount <= 0 ? "—" : onTrack ? "Feasible" : "Shortfall"}</Badge>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-body-md font-body-md text-on-surface-variant">
            Monthly income (applied)
          </span>
          <span className="text-data-tabular font-data-tabular text-secondary shrink-0">
            {formatVnd(monthlyIncome)}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-body-md font-body-md text-on-surface-variant">
            Combined starting balance
          </span>
          <span className="text-data-tabular font-data-tabular text-on-surface shrink-0">
            {formatVnd(startingBalance)}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-body-md font-body-md text-on-surface-variant">
            Months to target
          </span>
          <span className="text-data-tabular font-data-tabular text-on-surface shrink-0">
            {monthsToTarget}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-body-md font-body-md text-on-surface-variant">
            Projected balance at date
          </span>
          <span className="text-data-tabular font-data-tabular text-on-surface shrink-0">
            {formatVnd(projectedBalanceAtTarget)}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-body-md font-body-md text-on-surface-variant">Goal target</span>
          <span className="text-data-tabular font-data-tabular text-on-surface shrink-0">
            {formatVnd(targetAmount)}
          </span>
        </div>
        {note ? (
          <div className="mt-2 text-label-sm font-label-sm text-on-surface-variant bg-surface-container-low p-2 rounded">
            {note}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
