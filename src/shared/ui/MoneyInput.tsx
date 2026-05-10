"use client";

import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import type { ChangeEvent } from "react";
import { useId } from "react";

import { cn, formatThousands } from "@/shared/lib";

type MoneyInputProps = {
  label?: string;
  value: number;
  onChange: (next: number) => void;
  placeholder?: string;
  className?: string;
  symbol?: string;
  separated?: boolean;
};

export function MoneyInput({
  label,
  value,
  onChange,
  placeholder,
  className,
  symbol = "₫",
  separated = true,
}: MoneyInputProps) {
  const id = useId();
  const display =
    separated && Number.isFinite(value) ? formatThousands(value) : String(value || "");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^\d-]/g, "");
    const parsed = digits === "" || digits === "-" ? 0 : Number(digits);
    if (!Number.isNaN(parsed)) onChange(parsed);
  }

  return (
    <TextField
      id={id}
      label={label}
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      size="small"
      fullWidth
      variant="outlined"
      inputMode="numeric"
      className={cn(className)}
      slotProps={{
        input: {
          startAdornment: symbol ? (
            <InputAdornment position="start">
              <span className="font-data-tabular text-data-tabular text-on-surface-variant pointer-events-none">
                {symbol}
              </span>
            </InputAdornment>
          ) : undefined,
        },
      }}
      sx={{
        ...(label
          ? {
              "& .MuiInputLabel-root": {
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--color-on-surface-variant)",
              },
            }
          : {}),
        "& input": {
          fontVariantNumeric: "tabular-nums",
          textAlign: "right",
        },
      }}
    />
  );
}
