"use client";

import { format, parse } from "date-fns";
import { CheckCircle2, CircleDashed, Pencil } from "lucide-react";
import { useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/shared/lib";
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
import { SectionEditActions } from "./section-edit-actions";
import { StartingBalancesModal } from "./starting-balances-modal";

type PlanSection = "basics" | "checkpoints" | "starting" | "income";

type GoalCreatorFormProps = {
  profile: GoalProfile;
  /** Last persisted plan used to cancel section edits. */
  savedProfile: GoalProfile;
  savedPlans: GoalProfile[];
  seedOptions: GoalStartingOption[];
  monthlyIncomeTotal: number;
  /** Household income − average spending (settings). */
  monthlyNetContribution: number;
  onChange: (next: GoalProfile) => void;
  onSimulate: () => void;
  /** Persist the plan. Pass `override` to save edits made in the same tick. */
  onPersist: (override?: GoalProfile) => void | Promise<void>;
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
  savedProfile,
  savedPlans,
  seedOptions,
  monthlyIncomeTotal,
  monthlyNetContribution,
  onChange,
  onSimulate,
  onPersist,
}: GoalCreatorFormProps) {
  const [editingSection, setEditingSection] = useState<PlanSection | null>(null);
  const [startingBalancesOpen, setStartingBalancesOpen] = useState(false);
  const [checkpointsOpen, setCheckpointsOpen] = useState(false);
  const [paidToggleConfirm, setPaidToggleConfirm] = useState<{
    id: string;
    nextPaid: boolean;
  } | null>(null);

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

  const paidConfirmRow =
    paidToggleConfirm &&
    sortedCheckpointsDisplay.find((c) => c.id === paidToggleConfirm.id);

  const includesIncome = profile.includeMonthlyIncome !== false;
  const planName = profile.name.trim();

  const editingBasics = editingSection === "basics";
  const editingIncome = editingSection === "income";

  async function applyCheckpointsAndSave(next: GoalCheckpoint[]) {
    const updated = { ...profile, checkpoints: next };
    onChange(updated);
    onSimulate();
    await onPersist(updated);
    setCheckpointsOpen(false);
  }

  async function applyStartingBalancesAndSave(seedLines: GoalSeedLine[]) {
    const updated = { ...profile, seedLines };
    onChange(updated);
    onSimulate();
    await onPersist(updated);
    setStartingBalancesOpen(false);
  }

  async function commitCheckpointPaidToggle() {
    if (!paidToggleConfirm) return;
    const { id, nextPaid } = paidToggleConfirm;
    const nextCheckpoints = checkpoints.map((c) => {
      if (c.id !== id) return c;
      if (nextPaid) return { ...c, paid: true };
      return { id: c.id, date: c.date, amount: c.amount };
    });
    const updated = { ...profile, checkpoints: nextCheckpoints };
    onChange(updated);
    onSimulate();
    await onPersist(updated);
    setPaidToggleConfirm(null);
  }

  function cancelSection(section: PlanSection) {
    switch (section) {
      case "basics":
        onChange({
          ...profile,
          name: savedProfile.name,
          targetAmount: savedProfile.targetAmount,
          targetDate: savedProfile.targetDate,
        });
        break;
      case "income":
        onChange({
          ...profile,
          includeMonthlyIncome: savedProfile.includeMonthlyIncome,
        });
        break;
    }
    onSimulate();
    setEditingSection(null);
  }

  async function saveSection(section: PlanSection) {
    await onPersist(profile);
    setEditingSection(null);
  }

  function startEdit(section: PlanSection) {
    setEditingSection(section);
  }

  return (
    <Card variant="primary">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base font-semibold">Plan setup</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-4">
          {/* Plan basics */}
          <div className="rounded-lg border bg-muted/30 p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <FieldLabel>Plan details</FieldLabel>
              <SectionEditActions
                editing={editingBasics}
                onEdit={() => startEdit("basics")}
                onSave={() => void saveSection("basics")}
                onCancel={() => cancelSection("basics")}
                saveLabel="Save plan details"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor={editingBasics ? "goal-name" : undefined}
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Plan name
                </Label>
                {editingBasics ? (
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

              {editingBasics ? (
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

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor={editingBasics ? "goal-target-date" : undefined}
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Target Date
                </Label>
                {editingBasics ? (
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
            </div>
          </div>

          {/* Checkpoints */}
          <div className="min-w-0 rounded-lg border bg-muted/30 p-4 md:p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <FieldLabel>Checkpoints</FieldLabel>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label="Edit checkpoints"
                onClick={() => setCheckpointsOpen(true)}
              >
                <Pencil className="size-4" />
              </Button>
            </div>
            {sortedCheckpointsDisplay.length === 0 ? (
              <p className="rounded-md border border-dashed px-2 py-2 text-center text-xs text-muted-foreground">
                No checkpoints set.
              </p>
            ) : (
              <>
                <div className="mb-1 grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_auto] gap-x-2 border-b border-border/50 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:gap-x-3 sm:px-3">
                  <span className="min-w-0">Date</span>
                  <span className="min-w-0 text-end leading-tight">
                    <span className="block">Payment</span>
                    <span className="block">Due</span>
                  </span>
                  <span className="min-w-0 shrink-0 text-end sm:w-[7.5rem]">
                    Status
                  </span>
                </div>
                <ul className="min-w-0 divide-y divide-border/60 overflow-x-auto rounded-md border bg-card">
                  {sortedCheckpointsDisplay.map((cp, idx) => {
                    const running = sortedCheckpointsDisplay
                      .slice(0, idx + 1)
                      .reduce((s, x) => s + x.amount, 0);
                    const isPaid = cp.paid === true;
                    return (
                      <li
                        key={cp.id}
                        className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_auto] items-center gap-x-2 px-2 py-2 text-sm sm:gap-x-3 sm:px-3"
                      >
                        <span className="min-w-0 font-data-tabular tabular-nums">
                          {formatDisplayDate(cp.date)}
                        </span>
                        <div className="min-w-0 text-end font-data-tabular tabular-nums leading-snug">
                          <div className="text-emerald-600 dark:text-emerald-400">
                            {formatVnd(cp.amount)}
                          </div>
                          <div className="text-foreground">{formatVnd(running)}</div>
                        </div>
                        <div className="flex shrink-0 justify-end min-w-[60px]">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 px-2 text-xs"
                            onClick={() =>
                              setPaidToggleConfirm({
                                id: cp.id,
                                nextPaid: !isPaid,
                              })
                            }
                          >
                            {isPaid ? (
                              <>
                                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                Paid
                              </>
                            ) : (
                              <>
                                <CircleDashed className="size-3.5 text-muted-foreground" />
                                Unpaid
                              </>
                            )}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>

          <AlertDialog
            open={paidToggleConfirm !== null}
            onOpenChange={(open) => {
              if (!open) setPaidToggleConfirm(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {paidToggleConfirm?.nextPaid
                    ? "Mark checkpoint as paid?"
                    : "Mark checkpoint as unpaid?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {paidToggleConfirm ? (
                    <>
                      {paidToggleConfirm.nextPaid
                        ? "This records that this installment has been paid. A marker appears on the projection chart at the cumulative amount after this payment."
                        : "This removes the paid marker from the projection chart for this checkpoint."}
                      {paidConfirmRow ? (
                        <span className="mt-2 block font-medium text-foreground">
                          {formatDisplayDate(paidConfirmRow.date)} —{" "}
                          {formatVnd(paidConfirmRow.amount)}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  type="button"
                  onClick={() => void commitCheckpointPaidToggle()}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <CheckpointsModal
            open={checkpointsOpen}
            onClose={() => setCheckpointsOpen(false)}
            profile={profile}
            onApply={applyCheckpointsAndSave}
          />

          {/* Starting balances */}
          <div className="rounded-lg border bg-muted/30 p-4 md:p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <FieldLabel>Starting balances</FieldLabel>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label="Edit starting balances"
                onClick={() => setStartingBalancesOpen(true)}
              >
                <Pencil className="size-4" />
              </Button>
            </div>

            {lines.length === 0 ? (
              <p className="mb-2 rounded-md border border-dashed px-2 py-2 text-center text-xs text-muted-foreground">
                No sources allocated.
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

            <div className="rounded-md border bg-card px-3 py-2 text-sm">
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
            onApply={applyStartingBalancesAndSave}
          />

          {/* Monthly income */}
          <div className="rounded-lg border bg-muted/30 p-4 md:p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <FieldLabel>Monthly income (from settings)</FieldLabel>
              <SectionEditActions
                editing={editingIncome}
                onEdit={() => startEdit("income")}
                onSave={() => void saveSection("income")}
                onCancel={() => cancelSection("income")}
                saveLabel="Save income setting"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {editingIncome ? (
                <Tabs
                  value={includesIncome ? "include" : "exclude"}
                  onValueChange={(value) =>
                    onChange({
                      ...profile,
                      includeMonthlyIncome: value === "include",
                    })
                  }
                  className="shrink-0"
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="include" className="text-xs">
                      Include
                    </TabsTrigger>
                    <TabsTrigger value="exclude" className="text-xs">
                      Exclude
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              ) : (
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                    includesIncome
                      ? "border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {includesIncome ? "Included" : "Excluded"}
                </span>
              )}
            </div>
            {includesIncome ? (
              <div className="mt-2 flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">
                  Income{" "}
                  <span className="font-data-tabular tabular-nums font-medium text-foreground">
                    {formatVnd(monthlyIncomeTotal)}
                  </span>
                  /mo − spending → net
                </p>
                <p
                  className={cn(
                    "text-lg font-semibold font-data-tabular tabular-nums",
                    monthlyNetContribution >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive",
                  )}
                >
                  {formatVnd(monthlyNetContribution)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / month in projection
                  </span>
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Monthly income is excluded from this plan.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
