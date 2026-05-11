"use client";

import { useMemo, useState } from "react";

import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

import { assetCategoryBadgeClassNames } from "@/shared/config";
import {
  cn,
  effectiveGoalSeedLineAmount,
  formatVnd,
  labelForSeedLine,
  totalGoalStartingBalance,
  type GoalStartingOption,
} from "@/shared/lib";
import type { GoalProfile, GoalSeedLine } from "@/shared/storage";
import { Button, Card, MoneyInput, MaterialIcon } from "@/shared/ui";

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

  const lines = useMemo(() => profile.seedLines ?? [], [profile.seedLines]);

  const combinedStarting = useMemo(
    () => totalGoalStartingBalance(lines, seedOptions, savedPlans, profile),
    [lines, seedOptions, savedPlans, profile],
  );

  function applyStartingBalances(seedLines: GoalSeedLine[]) {
    onChange({ ...profile, seedLines });
    onSimulate();
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card className="p-stack-md">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-sm border-b border-outline-variant pb-2">
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
                Configure…
              </Button>
            </div>
            <p className="mb-3 text-body-sm font-body-md text-on-surface-variant">
              Amounts allocated from each asset for this plan (shared pool across all plans). Use
              the editor to add sources and set how much you take from each.
            </p>

            {lines.length === 0 ? (
              <p className="mb-3 rounded-md border border-dashed border-outline-variant bg-surface-container-low px-3 py-4 text-center text-body-sm text-on-surface-variant">
                None configured — open the editor to choose sources and amounts.
              </p>
            ) : (
              <ul className="mb-3 divide-y divide-outline-variant/60 rounded-md border border-outline-variant bg-surface-container-lowest">
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
            <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Monthly income (applied)
            </p>
            <p className="mt-1 font-data-tabular text-data-tabular text-secondary text-lg">
              {formatVnd(monthlyIncomeTotal)}{" "}
              <span className="text-body-md text-on-surface-variant">
                / month
              </span>
            </p>
            <p className="mt-2 text-body-sm font-body-md text-on-surface-variant">
              Total of all entries under Asset configuration → Income sources.
              Update them there to change this projection.
            </p>
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
