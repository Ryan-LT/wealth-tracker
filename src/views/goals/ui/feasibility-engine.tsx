"use client";

import { Check, CircleHelp, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/lib";
import { formatVnd } from "@/shared/lib";

type FeasibilityEngineProps = {
  monthlyIncome: number;
  incomeConfiguredTotal?: number;
  startingBalance: number;
  projectedBalanceAtTarget: number;
  targetAmount: number;
  monthsToTarget: number;
  note?: string;
};

export function FeasibilityEngine({
  monthlyIncome,
  incomeConfiguredTotal,
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-3">
        <CardTitle className="text-base font-semibold">Feasibility</CardTitle>
        <Icon className={cn("size-5", iconClass)} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-4">
        <Row label="Status">
          <Badge variant={onTrack ? "secondary" : "outline"}>
            {targetAmount <= 0 ? "—" : onTrack ? "Feasible" : "Shortfall"}
          </Badge>
        </Row>
        <div className="flex flex-col gap-0.5">
          <Row label="Monthly income (in projection)">
            <Money value={monthlyIncome} accent />
          </Row>
          {incomeConfiguredTotal !== undefined &&
          monthlyIncome === 0 &&
          incomeConfiguredTotal > 0 ? (
            <p className="text-xs text-muted-foreground">
              Off — settings still {formatVnd(incomeConfiguredTotal)}/mo.
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
          <p className="mt-2 rounded bg-muted p-2 text-xs text-muted-foreground">{note}</p>
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

function Money({ value, accent }: { value: number; accent?: boolean }) {
  return (
    <span
      className={cn(
        "text-sm font-data-tabular tabular-nums shrink-0",
        accent ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "font-medium",
      )}
    >
      {formatVnd(value)}
    </span>
  );
}
