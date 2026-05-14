"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { assetCategoryBadgeClassNames } from "@/shared/config";
import {
  appendGoalSeedLine,
  effectiveGoalSeedLineAmount,
  formatVnd,
  labelForSeedLine,
  liveBalanceForSourceKey,
  maxAllocationForSourceKey,
  type GoalStartingOption,
} from "@/shared/lib";
import type { GoalProfile, GoalSeedLine } from "@/shared/storage";
import { MoneyInput } from "@/shared/ui";

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
  const [pendingKey, setPendingKey] = useState("");

  useEffect(() => {
    if (!open) {
      initForOpen.current = false;
      return;
    }
    if (!initForOpen.current) {
      initForOpen.current = true;
      setWorkingLines((profile.seedLines ?? []).map((l) => ({ ...l })));
      setPendingKey("");
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

  function addLine() {
    const next = appendGoalSeedLine(
      { ...profile, seedLines: workingLines },
      pendingKey,
      seedOptions,
      savedPlans,
    );
    if (next?.seedLines) {
      setWorkingLines(next.seedLines);
      setPendingKey("");
    }
  }

  function removeLine(id: string) {
    setWorkingLines((prev) => prev.filter((l) => l.id !== id));
  }

  function updateLineAllocation(id: string, amount: number) {
    setWorkingLines((prev) => prev.map((l) => (l.id === id ? { ...l, amount } : l)));
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
          <p className="text-xs text-muted-foreground">
            Per source; caps respect other plans. Custom = extra cash.
          </p>

          {workingLines.length === 0 ? (
            <p className="text-xs italic text-muted-foreground">Add at least one source.</p>
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
                  onAllocationChange={(amount) => updateLineAllocation(line.id, amount)}
                />
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Select value={pendingKey || undefined} onValueChange={setPendingKey}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Add source" />
                </SelectTrigger>
                <SelectContent>
                  {addableOptions.map((o) => (
                    <SelectItem key={o.key} value={o.key}>
                      <span className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate">{o.label}</span>
                        {o.category ? (
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              assetCategoryBadgeClassNames(o.category),
                            )}
                          >
                            {o.category}
                          </span>
                        ) : null}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" className="shrink-0" onClick={addLine}>
              Add
            </Button>
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
  const live =
    line.sourceKey !== "custom" ? liveBalanceForSourceKey(line.sourceKey, seedOptions) : 0;
  const maxAlloc =
    line.sourceKey !== "custom"
      ? maxAllocationForSourceKey(line.sourceKey, seedOptions, savedPlans, planDraft, line.id)
      : Number.POSITIVE_INFINITY;
  const effective = effectiveGoalSeedLineAmount(line, seedOptions, savedPlans, planDraft);
  const over = line.sourceKey !== "custom" && line.amount > maxAlloc;

  return (
    <li className="flex flex-col gap-2 rounded-md border bg-card p-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="min-w-0 truncate text-sm font-medium">{title}</p>
          {category ? (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                assetCategoryBadgeClassNames(category),
              )}
            >
              {category}
            </span>
          ) : null}
        </div>
        {line.sourceKey === "custom" ? (
          <div className="mt-2 max-w-xs">
            <MoneyInput
              label="Amount (₫)"
              value={line.amount}
              onChange={onAllocationChange}
              min={0}
              placeholder="0"
            />
          </div>
        ) : (
          <div className="mt-2 max-w-sm space-y-1">
            <MoneyInput
              label="Allocate from this source (₫)"
              value={line.amount}
              onChange={onAllocationChange}
              min={0}
              max={maxAlloc}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Live balance {formatVnd(live)}
              {maxAlloc < live ? (
                <> · Up to {formatVnd(maxAlloc)} for this plan (other plans reserve the rest)</>
              ) : null}
            </p>
            <p className="text-xs font-data-tabular tabular-nums text-emerald-600 dark:text-emerald-400">
              Counts toward plan: {formatVnd(effective)}
              {over ? (
                <span className="ml-2 text-destructive">(capped — exceeds pool)</span>
              ) : null}
            </p>
          </div>
        )}
      </div>
      <button
        type="button"
        aria-label={`Remove ${title}`}
        onClick={onRemove}
        className="self-end rounded p-1 text-muted-foreground hover:text-destructive sm:self-start"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
