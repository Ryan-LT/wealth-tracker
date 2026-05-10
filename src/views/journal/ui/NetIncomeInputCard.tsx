"use client";

import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useId, useState } from "react";

import { Button, Card, MaterialIcon } from "@/shared/ui";

type NetIncomeInputCardProps = {
  initialValue: number;
  onUpdate: (next: number) => void;
};

export function NetIncomeInputCard({ initialValue, onUpdate }: NetIncomeInputCardProps) {
  const [value, setValue] = useState(
    initialValue.toLocaleString("en-US", { minimumFractionDigits: 2 }),
  );
  const id = useId();

  function handleSubmit() {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) onUpdate(parsed);
  }

  return (
    <Card className="lg:col-span-8 p-6 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">
            Real Month Net Income
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Available liquidity for deployment.
          </p>
        </div>
        <MaterialIcon
          name="account_balance_wallet"
          className="text-secondary bg-secondary-container/20 p-2 rounded-lg"
        />
      </div>

      <div className="flex items-end gap-4 mt-8">
        <TextField
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0.00"
          size="medium"
          fullWidth
          variant="standard"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <span className="font-headline-lg text-headline-lg text-primary">₫</span>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& input": {
              fontSize: "1.25rem",
              lineHeight: "1.75rem",
              fontWeight: 600,
              textAlign: "right",
              color: "var(--color-primary)",
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "var(--color-outline-variant)",
              borderBottomWidth: 2,
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: "var(--color-secondary)",
            },
          }}
        />
        <Button type="button" variant="secondary" className="shrink-0 h-12" onClick={handleSubmit}>
          Update
        </Button>
      </div>
    </Card>
  );
}
