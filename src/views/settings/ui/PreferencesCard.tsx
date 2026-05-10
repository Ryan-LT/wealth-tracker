"use client";

import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";

import type { Preferences } from "@/shared/storage";
import { MaterialIcon } from "@/shared/ui";

type PreferencesCardProps = {
  preferences: Preferences;
  onChange: (next: Preferences) => void;
};

const DATE_FORMAT_OPTIONS: Preferences["dateFormat"][] = [
  "DD/MM/YYYY",
  "MM/DD/YYYY",
  "YYYY-MM-DD",
];

export function PreferencesCard({ preferences, onChange }: PreferencesCardProps) {
  function handleDateFormatChange(e: SelectChangeEvent) {
    onChange({
      ...preferences,
      dateFormat: e.target.value as Preferences["dateFormat"],
    });
  }

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg">
      <div className="p-stack-md border-b border-outline-variant bg-surface rounded-t-lg">
        <div className="flex items-center gap-stack-sm">
          <MaterialIcon name="settings" filled className="text-primary" />
          <h2 className="font-headline-md text-headline-md text-primary">Preferences</h2>
        </div>
      </div>
      <div className="p-stack-md flex flex-col gap-stack-md">
        <div className="flex justify-between items-center py-2 border-b border-surface-variant">
          <div>
            <h3 className="font-body-md text-body-md text-primary">Base Currency</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              All reports use this currency
            </p>
          </div>
          <span className="font-data-tabular text-data-tabular text-primary font-bold bg-surface-variant px-3 py-1 rounded">
            VND (₫)
          </span>
        </div>
        <div className="flex justify-between items-center py-2 gap-4">
          <div>
            <h3
              id="preferences-date-format-label"
              className="font-body-md text-body-md text-primary"
            >
              Date Format
            </h3>
          </div>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              id="preferences-date-format"
              value={preferences.dateFormat}
              onChange={handleDateFormatChange}
              aria-labelledby="preferences-date-format-label"
              sx={{
                bgcolor: "var(--color-surface-bright)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--color-outline-variant)",
                },
              }}
            >
              {DATE_FORMAT_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
    </section>
  );
}
