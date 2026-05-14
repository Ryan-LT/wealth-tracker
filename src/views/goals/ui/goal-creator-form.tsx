"use client";

import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { assetCategoryBadgeClassNames } from "@/shared/config";
import {
  effectiveGoalSeedLineAmount,
  formatDisplayDate,
  formatVnd,
  labelForSeedLine,
  totalGoalStartingBalance,
  type GoalStartingOption,
} from "@/shared/lib";
import type { GoalCheckpoint, GoalProfile, GoalSeedLine } from "@/shared/storage";
import { MoneyInput } from "@/shared/ui";

import { CheckpointsModal } from "./checkpoints-modal";
import { StartingBalancesModal } from "./starting-balances-modal";

type GoalCreatorFormProps = {
  profile: GoalProfile;
  savedPlans: GoalProfile[];
  seedOptions: GoalStartingOption[];
  monthlyIncomeTotal: number;
  onChange: (next: GoalProfile) => void;
  onSimulate: () => void;
  onSave: () => void;
};

export function GoalCreatorForm({
  profile,
  savedPlans,
  seedOptions,
  monthlyIncomeTotal,
  onChange,
  onSimulate,
  onSave,
}: GoalCreatorFormProps) {
  const [startingBalancesOpen, setStartingBalancesOpen] = useState(false);
  const [checkpointsOpen, setCheckpointsOpen] = useState(false);

  const lines = useMemo(() => profile.seedLines ?? [], [profile.seedLines]);

  const combinedStarting = useMemo(
    () => totalGoalStartingBalance(lines, seedOptions, savedPlans, profile),
    [lines, seedOptions, savedPlans, profile],
  );

  const checkpoints = useMemo(() => profile.checkpoints ?? [], [profile.checkpoints]);

  const sortedCheckpointsDisplay = useMemo(() => {
    return [...checkpoints]
      .filter((c) => String(c.date).trim())
      .map((c) => ({
        ...c,
        date: String(c.date).trim().split("T")[0],
        amount: Math.max(0, Math.floor(Number(c.amount) || 0)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [checkpoints]);

  function applyCheckpoints(next: GoalCheckpoint[]) {
    onChange({ ...profile, checkpoints: next });
    onSimulate();
  }

  function applyStartingBalances(seedLines: GoalSeedLine[]) {
    onChange({ ...profile, seedLines });
    onSimulate();
  }

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base font-semibold">Plan setup</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSimulate();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Plan name
            </Label>
            <Input
              id="goal-name"
              placeholder="e.g., Vacation Home"
              value={profile.name}
              onChange={(e) => onChange({ ...profile, name: e.target.value })}
            />
          </div>

          <MoneyInput
            label="Target Amount (₫)"
            value={profile.targetAmount}
            onChange={(targetAmount) => onChange({ ...profile, targetAmount })}
            placeholder="0"
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-target-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Target Date
            </Label>
            <Input
              id="goal-target-date"
              type="date"
              value={profile.targetDate || ""}
              onChange={(e) =>
                onChange({
                  ...profile,
                  targetDate: e.target.value,
                })
              }
            />
          </div>

          <div className="min-w-0 rounded-lg border bg-muted/30 px-3 py-3">
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Checkpoints
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCheckpointsOpen(true)}
              >
                <Pencil className="size-3.5" />
                Configure
              </Button>
            </div>
            {sortedCheckpointsDisplay.length === 0 ? (
              <p className="mb-2 rounded-md border border-dashed px-2 py-2 text-center text-xs text-muted-foreground">
                No checkpoints — open Configure
              </p>
            ) : (
              <>
                <div className="mb-1 grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-2 border-b border-border/50 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:gap-x-3 sm:px-3">
                  <span className="min-w-0">Date</span>
                  <span className="min-w-0 text-end">Payment</span>
                  <span className="min-w-0 text-end">Due</span>
                </div>
                <ul className="mb-3 min-w-0 divide-y divide-border/60 overflow-x-auto rounded-md border bg-card">
                  {sortedCheckpointsDisplay.map((cp, idx) => {
                    const running = sortedCheckpointsDisplay
                      .slice(0, idx + 1)
                      .reduce((s, x) => s + x.amount, 0);
                    return (
                      <li
                        key={cp.id}
                        className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-2 px-2 py-2 sm:gap-x-3 sm:px-3 text-sm"
                      >
                        <span className="min-w-0 font-data-tabular tabular-nums">
                          {formatDisplayDate(cp.date)}
                        </span>
                        <span className="min-w-0 break-all text-end font-data-tabular tabular-nums text-emerald-600 dark:text-emerald-400">
                          {formatVnd(cp.amount)}
                        </span>
                        <span className="min-w-0 break-all text-end font-data-tabular tabular-nums">
                          {formatVnd(running)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>

          <CheckpointsModal
            open={checkpointsOpen}
            onClose={() => setCheckpointsOpen(false)}
            profile={profile}
            onApply={applyCheckpoints}
          />

          <div>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Starting balances
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStartingBalancesOpen(true)}
              >
                <Pencil className="size-3.5" />
                Configure
              </Button>
            </div>

            {lines.length === 0 ? (
              <p className="mb-2 rounded-md border border-dashed px-2 py-2 text-center text-xs text-muted-foreground">
                No sources — open Configure
              </p>
            ) : (
              <ul className="mb-3 divide-y divide-border/60 rounded-md border bg-card">
                {lines.map((line) => {
                  const cat = seedOptions.find((o) => o.key === line.sourceKey)?.category;
                  const effective = effectiveGoalSeedLineAmount(
                    line,
                    seedOptions,
                    savedPlans,
                    profile,
                  );
                  return (
                    <li
                      key={line.id}
                      className="flex items-center justify-between gap-3 px-3 py-2.5"
                    >
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {labelForSeedLine(line, seedOptions)}
                        </span>
                        {cat ? (
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              assetCategoryBadgeClassNames(cat),
                            )}
                          >
                            {cat}
                          </span>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-sm font-data-tabular tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatVnd(effective)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Combined allocated starting
              </span>
              <span className="ml-2 font-data-tabular tabular-nums font-semibold">
                {formatVnd(combinedStarting)}
              </span>
            </div>
          </div>

          <StartingBalancesModal
            open={startingBalancesOpen}
            onClose={() => setStartingBalancesOpen(false)}
            profile={profile}
            savedPlans={savedPlans}
            seedOptions={seedOptions}
            onApply={applyStartingBalances}
          />

          <div className="rounded-lg border bg-muted/30 px-3 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Monthly income (from settings)
                </p>
                <p
                  className={cn(
                    "mt-1 text-lg font-semibold font-data-tabular tabular-nums text-emerald-600 dark:text-emerald-400",
                    profile.includeMonthlyIncome === false && "opacity-45",
                  )}
                >
                  {formatVnd(monthlyIncomeTotal)}{" "}
                  <span className="text-sm text-muted-foreground">/ month</span>
                </p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-sm">
                <span>Include in projection</span>
                <Switch
                  checked={profile.includeMonthlyIncome !== false}
                  onCheckedChange={(checked) =>
                    onChange({ ...profile, includeMonthlyIncome: checked })
                  }
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" className="w-full">
              Update projection
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={onSave}>
              Save plan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
