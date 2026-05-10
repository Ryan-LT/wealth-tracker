"use client";

import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import { MaterialIcon } from "@/shared/ui";

type CashFlowFiltersProps = {
  date: string;
  onDateChange: (next: string) => void;
  category: string;
  onCategoryChange: (next: string) => void;
  categories: string[];
};

export function CashFlowFilters({
  date,
  onDateChange,
  category,
  onCategoryChange,
  categories,
}: CashFlowFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <TextField
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        size="small"
        variant="outlined"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <MaterialIcon name="calendar_month" size={18} className="text-on-surface-variant" />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          minWidth: 180,
          "& .MuiOutlinedInput-root": {
            bgcolor: "var(--color-surface-container-lowest)",
            height: 40,
          },
        }}
      />
      <TextField
        select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        size="small"
        variant="outlined"
        sx={{
          minWidth: 160,
          "& .MuiOutlinedInput-root": {
            bgcolor: "var(--color-surface-container-lowest)",
            height: 40,
          },
        }}
      >
        {categories.map((c) => (
          <MenuItem key={c} value={c}>
            {c}
          </MenuItem>
        ))}
      </TextField>
    </div>
  );
}
