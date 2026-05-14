"use client";

import { useMemo, useState } from "react";

import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

import { assetCategoryBadgeClassNames } from "@/shared/config";
import {
  cn,
  effectiveGoalSeedLineAmount,
  formatDisplayDate,
  formatVnd,
  labelForSeedLine,
  totalGoalStartingBalance,
  type GoalStartingOption,
} from "@/shared/lib";
import type { GoalCheckpoint, GoalProfile, GoalSeedLine } from "@/shared/storage";
import { Button, Card, MoneyInput, MaterialIcon } from "@/shared/ui";

import { CheckpointsModal } from "./CheckpointsModal";
import { StartingBalancesModal } from "./StartingBalancesModal";

type GoalCreatorFormProps = {
  profile: GoalProfile;
  /** All saved plans (excluding this draft's lines, which come from `profile`). */
  savedPlans: GoalProfile[];
  seedOptions: GoalStartingOption[];
  monthlyIncomeTotal: number;
  onChange: (next: GoalProfile) => void;
  onSimulate: () => void;
  onSave: () => void;
};

const labelSx = {
  "& .MuiInputLabel-root": {
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    color: "var(--color-on-surface-variant)",
  },
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card className="p-stack-md">
        <h3 className="text-headline-md text-headline-md text-on-surface mb-stack-sm border-b border-outline-variant pb-2">
          Plan setup
        </h3>
        <form
          className="flex flex-col gap-stack-md mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSimulate();
          }}
        >
          <TextField
            id="goal-name"
            label="Plan name"
            placeholder="e.g., Vacation Home"
            value={profile.name}
            onChange={(e) => onChange({ ...profile, name: e.target.value })}
            size="small"
            fullWidth
            sx={labelSx}
          />

          <MoneyInput
            label="Target Amount (₫)"
            value={profile.targetAmount}
            onChange={(targetAmount) => onChange({ ...profile, targetAmount })}
            placeholder="0"
          />

          <DatePicker
            label="Target Date"
            value={profile.targetDate ? dayjs(profile.targetDate) : null}
            onChange={(next) =>
              onChange({
                ...profile,
                targetDate:
                  next && next.isValid() ? next.format("YYYY-MM-DD") : "",
              })
            }
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                id: "goal-target-date",
                size: "small",
                fullWidth: true,
                sx: labelSx,
              },
            }}
          />

          <div className="min-w-0 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3">
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Checkpoints
              </p>
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                startIcon={<MaterialIcon name="edit" />}
                onClick={() => setCheckpointsOpen(true)}
              >
                Configure
              </Button>
            </div>
            {sortedCheckpointsDisplay.length === 0 ? (
              <p className="mb-2 rounded-md border border-dashed border-outline-variant bg-surface-container-low px-2 py-2 text-center text-label-sm text-on-surface-variant">
                No checkpoints — open Configure
              </p>
            ) : (
              <>
                <div className="mb-1 grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-2 border-b border-outline-variant/50 px-2 pb-1 text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant sm:gap-x-3 sm:px-3">
                  <span className="min-w-0">Date</span>
                  <span className="min-w-0 text-end">Payment</span>
                  <span className="min-w-0 text-end">Due</span>
                </div>
                <ul className="mb-3 min-w-0 divide-y divide-outline-variant/60 overflow-x-auto rounded-md border border-outline-variant bg-surface-container-lowest">
                  {sortedCheckpointsDisplay.map((cp, idx) => {
                    const running = sortedCheckpointsDisplay
                      .slice(0, idx + 1)
                      .reduce((s, x) => s + x.amount, 0);
                    return (
                      <li
                        key={cp.id}
                        className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-2 px-2 py-2.5 sm:gap-x-3 sm:px-3"
                      >
                        <span className="min-w-0 font-body-md text-on-surface tabular-nums">
                          {formatDisplayDate(cp.date)}
                        </span>
                        <span className="min-w-0 break-all text-end font-data-tabular text-data-tabular text-secondary">
                          {formatVnd(cp.amount)}
                        </span>
                        <span className="min-w-0 break-all text-end font-data-tabular text-data-tabular text-on-surface">
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
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Starting balances
              </p>
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                startIcon={<MaterialIcon name="edit" />}
                onClick={() => setStartingBalancesOpen(true)}
              >
                Configure
              </Button>
            </div>

            {lines.length === 0 ? (
              <p className="mb-2 rounded-md border border-dashed border-outline-variant bg-surface-container-low px-2 py-2 text-center text-label-sm text-on-surface-variant">
                No sources — open Configure
              </p>
            ) : (
              <ul className="mb-3 divide-y divide-outline-variant/60 rounded-md border border-outline-variant bg-surface-container-lowest">
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
                      <div className="min-w-0 flex flex-wrap items-center gap-2">
                        <span className="truncate font-body-md font-medium text-on-surface">
                          {labelForSeedLine(line, seedOptions)}
                        </span>
                        {cat ? (
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-label-sm font-label-sm",
                              assetCategoryBadgeClassNames(cat),
                            )}
                          >
                            {cat}
                          </span>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-data-tabular text-data-tabular text-secondary">
                        {formatVnd(effective)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="rounded-md border border-outline-variant bg-surface-container-low px-3 py-2">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                Combined allocated starting
              </span>
              <span className="ml-2 font-data-tabular text-data-tabular text-primary">
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

          <div className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Monthly income (from settings)
                </p>
                <p
                  className={cn(
                    "mt-1 font-data-tabular text-data-tabular text-secondary text-lg",
                    profile.includeMonthlyIncome === false && "opacity-45",
                  )}
                >
                  {formatVnd(monthlyIncomeTotal)}{" "}
                  <span className="text-body-md text-on-surface-variant">
                    / month
                  </span>
                </p>
              </div>
              <FormControlLabel
                className="m-0 shrink-0"
                control={
                  <Switch
                    size="small"
                    checked={profile.includeMonthlyIncome !== false}
                    onChange={(_, checked) =>
                      onChange({ ...profile, includeMonthlyIncome: checked })
                    }
                  />
                }
                label="Include in projection"
                labelPlacement="start"
                sx={{
                  marginRight: 0,
                  marginLeft: 0,
                  gap: 1,
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: "var(--color-on-surface)",
                  },
                }}
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button type="submit" block>
              Update projection
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              block
              onClick={onSave}
            >
              Save plan
            </Button>
          </div>
        </form>
      </Card>
    </LocalizationProvider>
  );
}
