"use client";

import { Check, CircleHelp, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/lib";
import { formatVnd } from "@/shared/lib";

type FeasibilityEngineProps = {
  /** Net monthly contribution in projection (income − spending when enabled). */
  monthlyNetContribution: number;
  monthlyIncomeTotal?: number;
  startingBalance: number;
  projectedBalanceAtTarget: number;
  targetAmount: number;
  monthsToTarget: number;
  note?: string;
};

export function FeasibilityEngine({
  monthlyNetContribution,
  monthlyIncomeTotal,
  startingBalance,
  projectedBalanceAtTarget,
  targetAmount,
  monthsToTarget,
  note,
}: FeasibilityEngineProps) {
  const onTrack =
    targetAmount > 0 && projectedBalanceAtTarget >= targetAmount && monthsToTarget >= 1;

  const Icon = targetAmount <= 0 ? CircleHelp : onTrack ? Check : TriangleAlert;
  const iconClass = cn(
    targetAmount <= 0
      ? "text-muted-foreground"
      : onTrack
        ? "text-emerald-500"
        : "text-destructive",
  );

  return (
    <Card variant="secondary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
        <CardTitle className="text-base font-semibold">Feasibility</CardTitle>
        <Icon className={cn("size-5", iconClass)} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-4">
        <Row label="Status">
          <Badge variant={onTrack ? "secondary" : "outline"}>
            {targetAmount <= 0 ? "—" : onTrack ? "Feasible" : "Shortfall"}
          </Badge>
        </Row>
        {monthlyIncomeTotal !== undefined && monthlyIncomeTotal > 0 ? (
          <Row label="Household income (settings)">
            <Money value={monthlyIncomeTotal} />
          </Row>
        ) : null}
        <div className="flex flex-col gap-0.5">
          <Row label="Monthly net in projection">
            <Money
              value={monthlyNetContribution}
              accent={monthlyNetContribution > 0}
              negative={monthlyNetContribution < 0}
            />
          </Row>
          {monthlyIncomeTotal !== undefined &&
          monthlyNetContribution === 0 &&
          monthlyIncomeTotal > 0 ? (
            <p className="text-xs text-muted-foreground">
              Income is offset by average monthly spending in settings.
            </p>
          ) : null}
        </div>
        <Row label="Allocated starting total">
          <Money value={startingBalance} />
        </Row>
        <Row label="Months to target">
          <span className="font-data-tabular tabular-nums text-sm">{monthsToTarget}</span>
        </Row>
        <Row label="Projected balance at date">
          <Money value={projectedBalanceAtTarget} />
        </Row>
        <Row label="Goal target">
          <Money value={targetAmount} />
        </Row>
        {note ? (
          <p className="mt-2 rounded-md bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            {note}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Money({
  value,
  accent,
  negative,
}: {
  value: number;
  accent?: boolean;
  negative?: boolean;
}) {
  return (
    <span
      className={cn(
        "text-sm font-data-tabular tabular-nums shrink-0 font-medium",
        negative
          ? "text-destructive font-semibold"
          : accent
            ? "text-emerald-600 dark:text-emerald-400 font-semibold"
            : undefined,
      )}
    >
      {formatVnd(value)}
    </span>
  );
}
