"use client";

import TextField from "@mui/material/TextField";

import type { GoalProfile } from "@/shared/storage";
import { Button, Card, MoneyInput } from "@/shared/ui";

type GoalCreatorFormProps = {
  profile: GoalProfile;
  onChange: (next: GoalProfile) => void;
  onSimulate: () => void;
  onSave: () => void;
};

export function GoalCreatorForm({
  profile,
  onChange,
  onSimulate,
  onSave,
}: GoalCreatorFormProps) {
  return (
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
          sx={{
            "& .MuiInputLabel-root": {
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--color-on-surface-variant)",
            },
          }}
        />

        <MoneyInput
          label="Target Amount (₫)"
          value={profile.targetAmount}
          onChange={(targetAmount) => onChange({ ...profile, targetAmount })}
          placeholder="0"
        />

        <TextField
          id="goal-target-date"
          label="Target Date"
          type="date"
          value={profile.targetDate}
          onChange={(e) => onChange({ ...profile, targetDate: e.target.value })}
          size="small"
          fullWidth
          slotProps={{
            inputLabel: { shrink: true },
          }}
          sx={{
            "& .MuiInputLabel-root": {
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--color-on-surface-variant)",
            },
          }}
        />

        <div className="pt-2 flex flex-col gap-2">
          <Button type="submit" block>
            Simulate Goal
          </Button>
          <Button type="button" variant="outline-secondary" block onClick={onSave}>
            Save Current Setup
          </Button>
        </div>
      </form>
    </Card>
  );
}
