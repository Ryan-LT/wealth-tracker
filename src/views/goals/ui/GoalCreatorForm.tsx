"use client";

import { useMemo, useState } from "react";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

import {
  appendGoalSeedLine,
  cn,
  formatVnd,
  labelForSeedLine,
  resolvedSeedLineAmount,
  totalGoalStartingBalance,
  type GoalStartingOption,
} from "@/shared/lib";
import type { GoalProfile, GoalSeedLine } from "@/shared/storage";
import { Button, Card, MoneyInput, MaterialIcon } from "@/shared/ui";

type GoalCreatorFormProps = {
  profile: GoalProfile;
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
  seedOptions,
  monthlyIncomeTotal,
  onChange,
  onSimulate,
  onSave,
}: GoalCreatorFormProps) {
  const [pendingKey, setPendingKey] = useState<string>("");

  const lines = useMemo(() => profile.seedLines ?? [], [profile.seedLines]);

  const combinedStarting = useMemo(
    () => totalGoalStartingBalance(lines, seedOptions),
    [lines, seedOptions],
  );

  const usedNonCustom = useMemo(() => {
    const s = new Set<string>();
    for (const l of lines) {
      if (l.sourceKey !== "custom") s.add(l.sourceKey);
    }
    return s;
  }, [lines]);

  const addableOptions = useMemo(
    () =>
      seedOptions.filter(
        (o) => o.key !== "none" && (o.isCustom || !usedNonCustom.has(o.key)),
      ),
    [seedOptions, usedNonCustom],
  );

  function addLine() {
    const next = appendGoalSeedLine(profile, pendingKey, seedOptions);
    if (next) {
      onChange(next);
      setPendingKey("");
    }
  }

  function removeLine(id: string) {
    onChange({
      ...profile,
      seedLines: lines.filter((l) => l.id !== id),
    });
  }

  function updateLineAmount(id: string, amount: number) {
    onChange({
      ...profile,
      seedLines: lines.map((l) =>
        l.id === id && l.sourceKey === "custom" ? { ...l, amount } : l,
      ),
    });
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card className="p-stack-md">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-sm border-b border-outline-variant pb-2">
          Goal Creator
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
            label="Goal Name"
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
            <p className="mb-2 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Starting balances
            </p>
            <p className="mb-3 text-body-sm font-body-md text-on-surface-variant">
              Add one or more asset lines or custom amounts. Values from the
              tracker and catalog stay live when those balances change.
            </p>

            {lines.length === 0 ? (
              <p className="mb-3 text-body-sm text-on-surface-variant italic">
                No sources yet — add at least one, or projections start from 0
                ₫.
              </p>
            ) : (
              <ul className="mb-3 flex flex-col gap-2">
                {lines.map((line) => (
                  <SeedLineRow
                    key={line.id}
                    line={line}
                    seedOptions={seedOptions}
                    onRemove={() => removeLine(line.id)}
                    onCustomAmount={(amount) =>
                      updateLineAmount(line.id, amount)
                    }
                  />
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <FormControl fullWidth size="small" className="sm:flex-1">
                <InputLabel id="goal-add-seed-label">Add source</InputLabel>
                <Select
                  labelId="goal-add-seed-label"
                  label="Add source"
                  value={pendingKey}
                  displayEmpty
                  onChange={(e) => setPendingKey(String(e.target.value))}
                >
                  {addableOptions.map((o) => (
                    <MenuItem key={o.key} value={o.key}>
                      {o.label}
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

            <div className="mt-3 rounded-md border border-outline-variant bg-surface-container-low px-3 py-2">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                Combined starting balance
              </span>
              <span className="ml-2 font-data-tabular text-data-tabular text-primary">
                {formatVnd(combinedStarting)}
              </span>
            </div>
          </div>

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
              Run projection
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              block
              onClick={onSave}
            >
              Save Current Setup
            </Button>
          </div>
        </form>
      </Card>
    </LocalizationProvider>
  );
}

type SeedLineRowProps = {
  line: GoalSeedLine;
  seedOptions: GoalStartingOption[];
  onRemove: () => void;
  onCustomAmount: (amount: number) => void;
};

function SeedLineRow({
  line,
  seedOptions,
  onRemove,
  onCustomAmount,
}: SeedLineRowProps) {
  const resolved = resolvedSeedLineAmount(line, seedOptions);
  const title = labelForSeedLine(line, seedOptions);

  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-md border border-outline-variant bg-surface-container-lowest p-3 sm:flex-row sm:items-center sm:justify-between",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="font-body-md font-medium text-on-surface truncate">
          {title}
        </p>
        <p className="mt-0.5 font-data-tabular text-data-tabular text-secondary">
          {formatVnd(resolved)}
          {line.sourceKey !== "custom" ? (
            <span className="ml-2 text-label-sm font-label-sm text-on-surface-variant">
              (live)
            </span>
          ) : null}
        </p>
        {line.sourceKey === "custom" ? (
          <div className="mt-2 max-w-xs">
            <MoneyInput
              label="Amount (₫)"
              value={line.amount}
              onChange={onCustomAmount}
              placeholder="0"
            />
          </div>
        ) : null}
      </div>
      <button
        type="button"
        aria-label={`Remove ${title}`}
        onClick={onRemove}
        className="self-end text-on-surface-variant hover:text-error sm:self-center"
      >
        <MaterialIcon name="delete" />
      </button>
    </li>
  );
}
