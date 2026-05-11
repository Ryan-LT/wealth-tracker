"use client";

import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";
import { NumericFormat, type NumberFormatValues } from "react-number-format";

import { cn } from "@/shared/lib";

export type MoneyInputProps = {
  label?: string;
  value: number;
  onChange: (next: number) => void;
  placeholder?: string;
  className?: string;
  /** Currency glyph before the value (empty string = no adornment). */
  symbol?: string;
  /** Fraction digits; `0` = whole VND amounts. */
  decimals?: number;
  allowNegative?: boolean;
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
  opts: { allowNegative: boolean; min?: number; max?: number },
): boolean {
  const v = values.floatValue;
  if (v === undefined) return true;
  if (!opts.allowNegative && v < 0) return false;
  if (opts.min !== undefined && v < opts.min) return false;
  if (opts.max !== undefined && v > opts.max) return false;
  return true;
}

/**
 * VND-style amount field with thousand separators while typing.
 * Uses `react-number-format` so the caret behaves correctly during edits.
 */
export function MoneyInput({
  label,
  value,
  onChange,
  placeholder,
  className,
  symbol = "₫",
  decimals = 0,
  allowNegative = false,
  min,
  max,
  size = "small",
  margin,
  variant = "outlined",
  fullWidth = true,
  autoFocus,
  disabled,
  sx,
}: MoneyInputProps) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return (
    <NumericFormat
      customInput={TextField}
      thousandSeparator=","
      decimalScale={decimals}
      fixedDecimalScale={decimals > 0}
      allowNegative={allowNegative}
      value={safeValue}
      onValueChange={(vals) => {
        onChange(vals.floatValue ?? 0);
      }}
      isAllowed={(vals) => allowValues(vals, { allowNegative, min, max })}
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
        ...sx,
      }}
    />
  );
}
