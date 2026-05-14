"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import MuiButton from "@mui/material/Button";
import Select from "@mui/material/Select";

import { assetCategoryBadgeClassNames } from "@/shared/config";
import {
  appendGoalSeedLine,
  cn,
  effectiveGoalSeedLineAmount,
  formatVnd,
  labelForSeedLine,
  liveBalanceForSourceKey,
  maxAllocationForSourceKey,
  type GoalStartingOption,
} from "@/shared/lib";
import type { GoalProfile, GoalSeedLine } from "@/shared/storage";
import { Button, MoneyInput, MaterialIcon } from "@/shared/ui";

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
    setWorkingLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, amount } : l)),
    );
  }

  function handleApply() {
    onApply(workingLines);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle className="font-headline-md text-headline-md text-primary border-b border-outline-variant pb-3">
        Starting balances
      </DialogTitle>
      <DialogContent className="flex flex-col gap-stack-md pt-4 max-h-[min(70vh,640px)] overflow-y-auto">
        <p className="text-label-sm text-on-surface-variant">
          Per source; caps respect other plans. Custom = extra cash.
        </p>

        {workingLines.length === 0 ? (
          <p className="text-label-sm text-on-surface-variant italic">Add at least one source.</p>
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
          <FormControl fullWidth size="small" className="sm:flex-1">
            <InputLabel id="starting-balances-add-label">Add source</InputLabel>
            <Select
              labelId="starting-balances-add-label"
              label="Add source"
              value={pendingKey}
              displayEmpty
              onChange={(e) => setPendingKey(String(e.target.value))}
            >
              {addableOptions.map((o) => (
                <MenuItem key={o.key} value={o.key}>
                  <span className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="truncate">{o.label}</span>
                    {o.category ? (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-label-sm font-label-sm",
                          assetCategoryBadgeClassNames(o.category),
                        )}
                      >
                        {o.category}
                      </span>
                    ) : null}
                  </span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="button"
            variant="outline-secondary"
            className="shrink-0"
            onClick={addLine}
          >
            Add
          </Button>
        </div>
      </DialogContent>
      <DialogActions className="border-t border-outline-variant px-4 py-3 gap-2">
        <MuiButton onClick={onClose} color="inherit">
          Cancel
        </MuiButton>
        <MuiButton onClick={handleApply} variant="contained" color="secondary">
          Apply to plan
        </MuiButton>
      </DialogActions>
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
    line.sourceKey !== "custom"
      ? liveBalanceForSourceKey(line.sourceKey, seedOptions)
      : 0;
  const maxAlloc =
    line.sourceKey !== "custom"
      ? maxAllocationForSourceKey(line.sourceKey, seedOptions, savedPlans, planDraft, line.id)
      : Number.POSITIVE_INFINITY;
  const effective = effectiveGoalSeedLineAmount(line, seedOptions, savedPlans, planDraft);
  const over = line.sourceKey !== "custom" && line.amount > maxAlloc;

  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-md border border-outline-variant bg-surface-container-lowest p-3 sm:flex-row sm:items-start sm:justify-between",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="min-w-0 truncate font-body-md font-medium text-on-surface">{title}</p>
          {category ? (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-label-sm font-label-sm",
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
            <p className="text-label-sm font-label-sm text-on-surface-variant">
              Live balance {formatVnd(live)}
              {maxAlloc < live ? (
                <>
                  {" "}
                  · Up to {formatVnd(maxAlloc)} for this plan (other plans reserve the rest)
                </>
              ) : null}
            </p>
            <p className="font-data-tabular text-data-tabular text-secondary">
              Counts toward plan: {formatVnd(effective)}
              {over ? (
                <span className="ml-2 text-label-sm font-label-sm text-error">
                  (capped — exceeds pool)
                </span>
              ) : null}
            </p>
          </div>
        )}
      </div>
      <button
        type="button"
        aria-label={`Remove ${title}`}
        onClick={onRemove}
        className="self-end text-on-surface-variant hover:text-error sm:self-start sm:mt-1"
      >
        <MaterialIcon name="delete" />
      </button>
    </li>
  );
}
