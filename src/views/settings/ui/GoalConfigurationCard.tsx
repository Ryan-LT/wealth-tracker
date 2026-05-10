"use client";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";

import { Button, MaterialIcon } from "@/shared/ui";

type GoalConfigurationCardProps = {
  primaryTarget: number;
  targetDate: string;
  onPrimaryTargetChange: (next: number) => void;
  onTargetDateChange: (next: string) => void;
};

export function GoalConfigurationCard({
  primaryTarget,
  targetDate,
  onPrimaryTargetChange,
  onTargetDateChange,
}: GoalConfigurationCardProps) {
  const parsedTargetDate =
    targetDate && dayjs(targetDate).isValid() ? dayjs(targetDate) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <section className="bg-surface-container-lowest border border-outline-variant rounded-lg">
        <div className="p-stack-md border-b border-outline-variant bg-surface rounded-t-lg">
          <div className="flex items-center gap-stack-sm">
            <MaterialIcon name="insights" filled className="text-primary" />
            <h2 className="font-headline-md text-headline-md text-primary">Goal Configuration</h2>
          </div>
        </div>
        <div className="p-stack-md flex flex-col gap-stack-md">
          <TextField
            id="primary-target"
            label="Primary Target (₫)"
            size="small"
            fullWidth
            value={primaryTarget.toLocaleString("en-US")}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, "");
              onPrimaryTargetChange(digits === "" ? 0 : Number(digits));
            }}
            sx={{
              "& .MuiInputLabel-root": {
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                color: "var(--color-on-surface-variant)",
              },
              "& input": {
                fontVariantNumeric: "tabular-nums",
              },
            }}
          />
          <DatePicker
            label="Target Date"
            value={parsedTargetDate}
            onChange={(newValue) => {
              if (newValue && dayjs(newValue).isValid()) {
                onTargetDateChange(dayjs(newValue).format("YYYY-MM-DD"));
              } else {
                onTargetDateChange("");
              }
            }}
            slotProps={{
              textField: {
                id: "target-date",
                size: "small",
                fullWidth: true,
                sx: {
                  "& .MuiInputLabel-root": {
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "var(--color-on-surface-variant)",
                  },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "var(--color-surface-bright)",
                  },
                },
              },
            }}
          />
          <Button variant="secondary" block className="mt-2">
            Manage Simulation Profiles
          </Button>
        </div>
      </section>
    </LocalizationProvider>
  );
}
