"use client";

import { ChevronDown, Coins, Plus, Trash2, Wallet } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  appendGoalSeedLine,
  effectiveGoalSeedLineAmount,
  formatVnd,
  goalUsageForSourceKey,
  labelForSeedLine,
  liveBalanceForSourceKey,
  maxAllocationForSourceKey,
  type GoalStartingOption,
  type SourceGoalUsage,
} from "@/shared/lib";
import type {
  GoalProfile,
  GoalSeedLine,
  SettingsAssetLiquidity,
} from "@/shared/storage";
import { AssetCategoryBadge, MoneyInput } from "@/shared/ui";

function LiquidityChip({ liquidity }: { liquidity: SettingsAssetLiquidity }) {
  const isInstant = liquidity === "instant";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
        isInstant
          ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300"
          : "bg-amber-500/15 text-amber-800 ring-amber-500/30 dark:text-amber-300",
      )}
    >
      {isInstant ? "Instant" : "Not instant"}
    </span>
  );
}

export type StartingBalancesModalProps = {
  open: boolean;
  onClose: () => void;
  profile: GoalProfile;
  savedPlans: GoalProfile[];
  seedOptions: GoalStartingOption[];
  onApply: (seedLines: GoalSeedLine[]) => void;
};

export function StartingBalancesModal({
  open,
  onClose,
  profile,
  savedPlans,
  seedOptions,
  onApply,
}: StartingBalancesModalProps) {
  const initForOpen = useRef(false);

  const [workingLines, setWorkingLines] = useState<GoalSeedLine[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      initForOpen.current = false;
      return;
    }
    if (!initForOpen.current) {
      initForOpen.current = true;
      setWorkingLines((profile.seedLines ?? []).map((l) => ({ ...l })));
      setPickerOpen(false);
    }
  }, [open, profile]);

  const planDraft = useMemo(
    () => ({ ...profile, seedLines: workingLines }),
    [profile, workingLines],
  );

  const usedNonCustom = useMemo(() => {
    const s = new Set<string>();
    for (const l of workingLines) {
      if (l.sourceKey !== "custom") s.add(l.sourceKey);
    }
    return s;
  }, [workingLines]);

  const addableOptions = useMemo(
    () =>
      seedOptions.filter(
        (o) => o.key !== "none" && (o.isCustom || !usedNonCustom.has(o.key)),
      ),
    [seedOptions, usedNonCustom],
  );

  function pickSource(key: string) {
    const next = appendGoalSeedLine(
      { ...profile, seedLines: workingLines },
      key,
      seedOptions,
      savedPlans,
    );
    if (next?.seedLines) {
      setWorkingLines(next.seedLines);
    }
    setPickerOpen(false);
  }

  function removeLine(id: string) {
    setWorkingLines((prev) => prev.filter((l) => l.id !== id));
  }

  function updateLineAllocation(id: string, amount: number) {
    setWorkingLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, amount } : l)),
    );
  }

  function handleApply() {
    onApply(workingLines);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Starting balances</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 max-h-[min(70vh,600px)] overflow-y-auto">
          {workingLines.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-6 text-center text-xs italic text-muted-foreground">
              No sources yet — add one below.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {workingLines.map((line) => (
                <ModalSeedLineRow
                  key={line.id}
                  line={line}
                  planDraft={planDraft}
                  savedPlans={savedPlans}
                  seedOptions={seedOptions}
                  onRemove={() => removeLine(line.id)}
                  onAllocationChange={(amount) =>
                    updateLineAllocation(line.id, amount)
                  }
                />
              ))}
            </ul>
          )}

          <div className="rounded-lg border bg-card">
            <Button
              type="button"
              variant="ghost"
              aria-expanded={pickerOpen}
              aria-controls="starting-balances-source-list"
              className="h-auto w-full justify-between rounded-lg px-3 py-2.5 text-sm font-medium"
              disabled={addableOptions.length === 0}
              onClick={() => setPickerOpen((o) => !o)}
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="size-4" />
                {addableOptions.length === 0
                  ? "All sources added"
                  : "Add source"}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  pickerOpen && "rotate-180",
                )}
              />
            </Button>
            {pickerOpen && addableOptions.length > 0 ? (
              <div
                id="starting-balances-source-list"
                className="border-t border-border/60"
              >
                <SourcePickerList
                  options={addableOptions}
                  planDraft={planDraft}
                  savedPlans={savedPlans}
                  onPick={pickSource}
                />
              </div>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply to plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type SourcePickerListProps = {
  options: GoalStartingOption[];
  planDraft: GoalProfile;
  savedPlans: GoalProfile[];
  onPick: (key: string) => void;
};

function SourcePickerList({
  options,
  planDraft,
  savedPlans,
  onPick,
}: SourcePickerListProps) {
  if (options.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground">
        No sources available.
      </div>
    );
  }

  return (
    <ul className="max-h-80 space-y-1 overflow-y-auto overscroll-contain p-1">
      {options.map((option) => (
        <li key={option.key}>
          <SourcePickerItem
            option={option}
            planDraft={planDraft}
            savedPlans={savedPlans}
            onPick={onPick}
          />
        </li>
      ))}
    </ul>
  );
}

type SourcePickerItemProps = {
  option: GoalStartingOption;
  planDraft: GoalProfile;
  savedPlans: GoalProfile[];
  onPick: (key: string) => void;
};

function SourcePickerItem({
  option,
  planDraft,
  savedPlans,
  onPick,
}: SourcePickerItemProps) {
  if (option.isCustom) {
    return (
      <button
        type="button"
        onClick={() => onPick(option.key)}
        className="group flex w-full items-start gap-3 rounded-md border border-dashed border-input bg-card px-3 py-2.5 text-start transition-colors hover:border-ring hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-background">
          <Coins className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Custom amount</span>
          <span className="block text-xs text-muted-foreground">
            Extra cash not tied to a tracked source
          </span>
        </span>
      </button>
    );
  }

  const live = Math.max(0, option.amount);
  const usage = goalUsageForSourceKey(option.key, savedPlans, planDraft);
  const reservedElsewhere = usage.reduce((s, u) => s + u.amount, 0);
  const remaining = Math.max(0, live - reservedElsewhere);
  const fullyReserved = live > 0 && remaining === 0;
  const emptySource = live === 0;

  return (
    <button
      type="button"
      onClick={() => onPick(option.key)}
      className={cn(
        "group flex w-full items-start gap-3 rounded-md border border-transparent bg-card px-3 py-2.5 text-start transition-colors hover:border-ring hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      )}
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-background">
        <Wallet className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="min-w-0 truncate text-sm font-medium">
            {option.label}
          </span>
          {option.category ? (
            <AssetCategoryBadge
              category={option.category}
              className="shrink-0 text-[10px]"
            />
          ) : null}
          {option.liquidity ? <LiquidityChip liquidity={option.liquidity} /> : null}
        </span>

        <span className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Available
          </span>
          <span
            className={cn(
              "font-data-tabular tabular-nums text-sm font-semibold",
              emptySource
                ? "text-muted-foreground"
                : fullyReserved
                  ? "text-destructive"
                  : "text-emerald-600 dark:text-emerald-400",
            )}
          >
            {formatVnd(remaining)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            of {formatVnd(live)} live
          </span>
        </span>

        {usage.length > 0 ? (
          <span className="mt-1 block">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Reserved by other plans
            </span>
            <span className="mt-1 flex flex-wrap gap-1">
              {usage.map((u) => (
                <span
                  key={u.planId}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px]"
                >
                  <span className="max-w-40 truncate font-medium">
                    {u.planName}
                  </span>
                  <span className="font-data-tabular tabular-nums text-muted-foreground">
                    {formatVnd(u.amount)}
                  </span>
                </span>
              ))}
            </span>
          </span>
        ) : emptySource ? (
          <span className="mt-1 block text-[11px] italic text-muted-foreground">
            No balance recorded.
          </span>
        ) : (
          <span className="mt-1 block text-[11px] italic text-muted-foreground">
            Not yet allocated to any other plan.
          </span>
        )}
      </span>
    </button>
  );
}

type ModalSeedLineRowProps = {
  line: GoalSeedLine;
  planDraft: GoalProfile;
  savedPlans: GoalProfile[];
  seedOptions: GoalStartingOption[];
  onRemove: () => void;
  onAllocationChange: (amount: number) => void;
};

function ModalSeedLineRow({
  line,
  planDraft,
  savedPlans,
  seedOptions,
  onRemove,
  onAllocationChange,
}: ModalSeedLineRowProps) {
  const title = labelForSeedLine(line, seedOptions);
  const option = seedOptions.find((o) => o.key === line.sourceKey);
  const category = option?.category;
  const liquidity = option?.liquidity;
  const isCustom = line.sourceKey === "custom";
  const live = !isCustom
    ? liveBalanceForSourceKey(line.sourceKey, seedOptions)
    : 0;
  const maxAlloc = !isCustom
    ? maxAllocationForSourceKey(
        line.sourceKey,
        seedOptions,
        savedPlans,
        planDraft,
        line.id,
      )
    : Number.POSITIVE_INFINITY;
  const effective = effectiveGoalSeedLineAmount(
    line,
    seedOptions,
    savedPlans,
    planDraft,
  );
  const over = !isCustom && line.amount > maxAlloc;
  const usage: SourceGoalUsage[] = !isCustom
    ? goalUsageForSourceKey(line.sourceKey, savedPlans, planDraft)
    : [];

  return (
    <li className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border/60 px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {isCustom ? (
              <Coins className="size-4" />
            ) : (
              <Wallet className="size-4" />
            )}
          </span>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="min-w-0 truncate text-sm font-semibold">{title}</p>
            {category ? (
              <AssetCategoryBadge
                category={category}
                className="shrink-0 text-[10px]"
              />
            ) : null}
            {liquidity ? <LiquidityChip liquidity={liquidity} /> : null}
          </div>
        </div>
        <button
          type="button"
          aria-label={`Remove ${title}`}
          onClick={onRemove}
          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <MoneyInput
            label={isCustom ? "Amount (₫)" : "Allocate from this source (₫)"}
            value={line.amount}
            onChange={onAllocationChange}
            min={0}
            max={isCustom ? undefined : maxAlloc}
            placeholder="0"
          />
        </div>

        {!isCustom ? (
          <dl className="flex-1 grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-[max-content_1fr] sm:gap-y-1.5">
            <dt className="text-muted-foreground">Live balance</dt>
            <dd className="font-data-tabular tabular-nums sm:text-end">
              {formatVnd(live)}
            </dd>

            <dt className="text-muted-foreground">Available to this plan</dt>
            <dd
              className={cn(
                "font-data-tabular tabular-nums sm:text-end",
                maxAlloc < live
                  ? "text-amber-600 dark:text-amber-400"
                  : undefined,
              )}
            >
              {formatVnd(maxAlloc)}
            </dd>

            <dt className="text-muted-foreground">Counts toward plan</dt>
            <dd className="font-data-tabular tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 sm:text-end">
              {formatVnd(effective)}
              {over ? (
                <span className="ms-2 text-[10px] font-semibold uppercase text-destructive">
                  Capped
                </span>
              ) : null}
            </dd>
          </dl>
        ) : (
          <p className="flex-1 text-xs italic text-muted-foreground sm:pt-6">
            Extra cash not tied to a tracked source.
          </p>
        )}
      </div>

      {usage.length > 0 ? (
        <div className="border-t border-border/60 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Also accumulated for
          </p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {usage.map((u) => (
              <li
                key={u.planId}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px]"
              >
                <span className="max-w-40 truncate font-medium">
                  {u.planName}
                </span>
                <span className="font-data-tabular tabular-nums text-muted-foreground">
                  {formatVnd(u.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
