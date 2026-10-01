"use client";

import { NumericFormat } from "react-number-format";

import { cn } from "@/shared/lib/cn";
import { Input } from "@/shared/ui/kit/input";

export type PercentInputProps = {
  value: number | undefined;
  onChange: (next: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  decimalScale?: number;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/** Percent with a comma decimal mark (`9,5 %`); accepts "." or "," while typing. */
export function PercentInput({
  value,
  onChange,
  onBlur,
  min = 0,
  max = 100,
  decimalScale = 3,
  placeholder = "0 %",
  className,
  ...rest
}: PercentInputProps) {
  return (
    <NumericFormat
      customInput={Input}
      decimalSeparator=","
      allowedDecimalSeparators={[",", "."]}
      decimalScale={decimalScale}
      suffix=" %"
      allowNegative={min < 0}
      value={Number.isFinite(value) ? value : ""}
      onValueChange={(vals) => onChange(vals.floatValue ?? 0)}
      onBlur={onBlur}
      isAllowed={(vals) => vals.floatValue === undefined || (vals.floatValue >= min && vals.floatValue <= max)}
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholder}
      className={cn("tabular-nums", className)}
      {...rest}
    />
  );
}
