"use client";

import { ShoppingCart } from "lucide-react";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Preferences } from "@/entities/preferences";
import {
  estimatedMonthlyNetCashflow,
  resolveAverageMonthlySpending,
} from "@/shared/lib";
import { cn, formatVnd } from "@/shared/lib";
import { MoneyInput } from "@/shared/ui";

type AverageMonthlySpendingSectionProps = {
  prefs: Preferences;
  totalMonthlyIncome: number;
  onSpendingChange: (amount: number) => void;
  loading?: boolean;
};

export function AverageMonthlySpendingSection({
  prefs,
  totalMonthlyIncome,
  onSpendingChange,
  loading = false,
}: AverageMonthlySpendingSectionProps) {
  const spending = resolveAverageMonthlySpending(prefs);
  const monthlyNet = useMemo(
    () => estimatedMonthlyNetCashflow(prefs, totalMonthlyIncome),
    [prefs, totalMonthlyIncome],
  );

  return (
    <Card variant="outflow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b [.border-b]:pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ShoppingCart className="size-4 text-primary" />
          Average Monthly Spending
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-4">
        <p className="text-xs text-muted-foreground">
          Used with income sources to estimate monthly net savings on the dashboard,
          goal projections, and end-of-year trajectory.
        </p>

        {loading ? (
          <Skeleton className="h-10 w-full max-w-xs" />
        ) : (
          <MoneyInput
            label="Average monthly spending (₫)"
            value={spending}
            onChange={onSpendingChange}
            placeholder="0"
            min={0}
            className="w-fit"
          />
        )}

        <dl className="grid gap-4 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Income (settings)
            </dt>
            <dd className="mt-1 font-data-tabular tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
              {loading ? (
                <Skeleton className="h-5 w-28" />
              ) : (
                `${formatVnd(totalMonthlyIncome)}/mo`
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Spending
            </dt>
            <dd className="mt-1 font-data-tabular tabular-nums font-semibold text-destructive">
              {loading ? (
                <Skeleton className="h-5 w-28" />
              ) : (
                `−${formatVnd(spending)}/mo`
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net monthly savings
            </dt>
            <dd
              className={cn(
                "mt-1 font-data-tabular tabular-nums font-semibold",
                monthlyNet >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-destructive",
              )}
            >
              {loading ? (
                <Skeleton className="h-5 w-28" />
              ) : (
                `${monthlyNet >= 0 ? "" : "−"}${formatVnd(Math.abs(monthlyNet))}/mo`
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
