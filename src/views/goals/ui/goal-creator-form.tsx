"use client";

import { format, parse } from "date-fns";
import { Lock, Pencil, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  effectiveGoalSeedLineAmount,
  formatDisplayDate,
  formatVnd,
  labelForSeedLine,
  totalGoalStartingBalance,
  type GoalStartingOption,
} from "@/shared/lib";
import type {
  GoalCheckpoint,
  GoalProfile,
  GoalSeedLine,
} from "@/shared/storage";
import { AssetCategoryBadge, MoneyInput } from "@/shared/ui";

import { CheckpointsModal } from "./checkpoints-modal";
import { StartingBalancesModal } from "./starting-balances-modal";

type GoalCreatorFormProps = {
  profile: GoalProfile;
  savedPlans: GoalProfile[];
  seedOptions: GoalStartingOption[];
  monthlyIncomeTotal: number;
  editMode: boolean;
  onChange: (next: GoalProfile) => void;
  onSimulate: () => void;
  onSave: () => void;
  onEnterEdit: () => void;
  onCancelEdit: () => void;
};

function formatTargetDate(iso: string | undefined): string {
  if (!iso) return "—";
  const trimmed = iso.trim().split("T")[0];
  const d = parse(trimmed, "yyyy-MM-dd", new Date());
  if (Number.isNaN(d.getTime())) return iso;
  return format(d, "dd/MM/yyyy");
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

export function GoalCreatorForm({
  profile,
  savedPlans,
  seedOptions,
  monthlyIncomeTotal,
  editMode,
  onChange,
  onSimulate,
  onSave,
  onEnterEdit,
  onCancelEdit,
}: GoalCreatorFormProps) {
  const [startingBalancesOpen, setStartingBalancesOpen] = useState(false);
  const [checkpointsOpen, setCheckpointsOpen] = useState(false);

  const lines = useMemo(() => profile.seedLines ?? [], [profile.seedLines]);

  const combinedStarting = useMemo(
    () => totalGoalStartingBalance(lines, seedOptions, savedPlans, profile),
    [lines, seedOptions, savedPlans, profile],
  );

  const checkpoints = useMemo(
    () => profile.checkpoints ?? [],
    [profile.checkpoints],
  );

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

  const includesIncome = profile.includeMonthlyIncome !== false;
  const planName = profile.name.trim();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          Plan setup
          {editMode ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Pencil className="size-3" />
              Editing
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Lock className="size-3" />
              View
            </span>
          )}
        </CardTitle>
        {editMode ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancelEdit}
          >
            <X className="size-3.5" />
            Cancel
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onEnterEdit}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!editMode) return;
            onSimulate();
          }}
        >
          {/* Plan name */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor={editMode ? "goal-name" : undefined}
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Plan name
            </Label>
            {editMode ? (
              <Input
                id="goal-name"
                placeholder="e.g., Vacation Home"
                value={profile.name}
                onChange={(e) => onChange({ ...profile, name: e.target.value })}
              />
            ) : (
              <p className="text-base font-medium">
                {planName || (
                  <span className="text-muted-foreground">Untitled plan</span>
                )}
              </p>
            )}
          </div>

          {/* Target amount */}
          {editMode ? (
            <MoneyInput
              label="Target Amount (₫)"
              value={profile.targetAmount}
              onChange={(targetAmount) =>
                onChange({ ...profile, targetAmount })
              }
              placeholder="0"
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Target Amount</FieldLabel>
              <p className="text-base font-semibold font-data-tabular tabular-nums">
                {profile.targetAmount > 0 ? (
                  formatVnd(profile.targetAmount)
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </p>
            </div>
          )}

          {/* Target date */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor={editMode ? "goal-target-date" : undefined}
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Target Date
            </Label>
            {editMode ? (
              <DatePicker
                id="goal-target-date"
                value={profile.targetDate || ""}
                onChange={(targetDate) => onChange({ ...profile, targetDate })}
              />
            ) : (
              <p className="text-base font-medium font-data-tabular tabular-nums">
                {profile.targetDate ? (
                  formatTargetDate(profile.targetDate)
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </p>
            )}
          </div>

          {/* Checkpoints */}
          <div className="min-w-0 rounded-lg border bg-muted/30 px-3 py-3">
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
              <FieldLabel>Checkpoints</FieldLabel>
              {editMode ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCheckpointsOpen(true)}
                >
                  <Pencil className="size-3.5" />
                  Configure
                </Button>
              ) : null}
            </div>
            {sortedCheckpointsDisplay.length === 0 ? (
              <p className="rounded-md border border-dashed px-2 py-2 text-center text-xs text-muted-foreground">
                {editMode
                  ? "No checkpoints — open Configure"
                  : "No checkpoints set."}
              </p>
            ) : (
              <>
                <div className="mb-1 grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-2 border-b border-border/50 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:gap-x-3 sm:px-3">
                  <span className="min-w-0">Date</span>
                  <span className="min-w-0 text-end">Payment</span>
                  <span className="min-w-0 text-end">Due</span>
                </div>
                <ul className="min-w-0 divide-y divide-border/60 overflow-x-auto rounded-md border bg-card">
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
            open={checkpointsOpen && editMode}
            onClose={() => setCheckpointsOpen(false)}
            profile={profile}
            onApply={applyCheckpoints}
          />

          {/* Starting balances */}
          <div>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
              <FieldLabel>Starting balances</FieldLabel>
              {editMode ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStartingBalancesOpen(true)}
                >
                  <Pencil className="size-3.5" />
                  Configure
                </Button>
              ) : null}
            </div>

            {lines.length === 0 ? (
              <p className="mb-2 rounded-md border border-dashed px-2 py-2 text-center text-xs text-muted-foreground">
                {editMode
                  ? "No sources — open Configure"
                  : "No sources allocated."}
              </p>
            ) : (
              <ul className="mb-3 divide-y divide-border/60 rounded-md border bg-card">
                {lines.map((line) => {
                  const cat = seedOptions.find(
                    (o) => o.key === line.sourceKey,
                  )?.category;
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
                          <AssetCategoryBadge
                            category={cat}
                            className="shrink-0 text-[11px]"
                          />
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
            open={startingBalancesOpen && editMode}
            onClose={() => setStartingBalancesOpen(false)}
            profile={profile}
            savedPlans={savedPlans}
            seedOptions={seedOptions}
            onApply={applyStartingBalances}
          />

          {/* Monthly income */}
          <div className="rounded-lg border bg-muted/30 px-3 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <FieldLabel>Monthly income (from settings)</FieldLabel>
                <p
                  className={cn(
                    "mt-1 text-lg font-semibold font-data-tabular tabular-nums text-emerald-600 dark:text-emerald-400",
                    !includesIncome && "opacity-45",
                  )}
                >
                  {formatVnd(monthlyIncomeTotal)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / month
                  </span>
                </p>
              </div>
              {editMode ? (
                <label className="flex shrink-0 items-center gap-2 text-sm">
                  <span>Include in projection</span>
                  <Switch
                    checked={includesIncome}
                    onCheckedChange={(checked) =>
                      onChange({ ...profile, includeMonthlyIncome: checked })
                    }
                  />
                </label>
              ) : (
                <span
                  className={cn(
                    "shrink-0 self-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                    includesIncome
                      ? "border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {includesIncome ? "Included" : "Excluded"}
                </span>
              )}
            </div>
          </div>

          {editMode ? (
            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onSave}
              >
                Save plan
              </Button>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
