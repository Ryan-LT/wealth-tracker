"use client";

import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";
import { NumericFormat, type NumberFormatValues } from "react-number-format";

import { cn } from "@/shared/lib";

export type PercentInputProps = {
  label?: string;
  value: number;
  onChange: (next: number) => void;
  placeholder?: string;
  className?: string;
  /** Fraction digits after the decimal (comma in vi-style display). */
  decimalScale?: number;
  min?: number;
  max?: number;
  size?: TextFieldProps["size"];
  margin?: TextFieldProps["margin"];
  variant?: TextFieldProps["variant"];
  fullWidth?: TextFieldProps["fullWidth"];
  autoFocus?: boolean;
  disabled?: boolean;
  sx?: TextFieldProps["sx"];
};

function allowValues(
  values: NumberFormatValues,
  opts: { min?: number; max?: number },
): boolean {
  const v = values.floatValue;
  if (v === undefined) return true;
  if (opts.min !== undefined && v < opts.min) return false;
  if (opts.max !== undefined && v > opts.max) return false;
  return true;
}

/**
 * Percent field with Vietnamese-style decimal comma (e.g. `5,5 %`).
 * Accepts both comma and period while typing.
 */
export function PercentInput({
  label,
  value,
  onChange,
  placeholder,
  className,
  decimalScale = 3,
  min = 0,
  max = 100,
  size = "small",
  margin,
  variant = "outlined",
  fullWidth = true,
  autoFocus,
  disabled,
  sx,
}: PercentInputProps) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return (
    <NumericFormat
      customInput={TextField}
      thousandSeparator={false}
      decimalSeparator=","
      allowedDecimalSeparators={[",", "."]}
      decimalScale={decimalScale}
      fixedDecimalScale={false}
      suffix=" %"
      value={safeValue}
      onValueChange={(vals) => {
        onChange(vals.floatValue ?? 0);
      }}
      isAllowed={(vals) => allowValues(vals, { min, max })}
      label={label}
      placeholder={placeholder}
      size={size}
      margin={margin}
      variant={variant}
      fullWidth={fullWidth}
      autoFocus={autoFocus}
      disabled={disabled}
      className={cn(className)}
      inputMode="decimal"
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
        ...sx,
      }}
    />
  );
}
