"use client";

import { NumericFormat, type NumberFormatValues } from "react-number-format";

import { Input as ShadcnInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type PercentInputProps = {
  label?: string;
  value: number;
  onChange: (next: number) => void;
  placeholder?: string;
  className?: string;
  decimalScale?: number;
  min?: number;
  max?: number;
  size?: "small" | "medium";
  autoFocus?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  id?: string;
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

export function PercentInput({
  label,
  value,
  onChange,
  placeholder,
  className,
  decimalScale = 3,
  min = 0,
  max = 100,
  autoFocus,
  disabled,
  id,
}: PercentInputProps) {
  const safeValue = Number.isFinite(value) ? value : 0;

  const input = (
    <NumericFormat
      id={id}
      customInput={ShadcnInput}
      thousandSeparator={false}
      decimalSeparator=","
      allowedDecimalSeparators={[",", "."]}
      decimalScale={decimalScale}
      fixedDecimalScale={false}
      suffix=" %"
      value={safeValue}
      onValueChange={(vals) => onChange(vals.floatValue ?? 0)}
      isAllowed={(vals) => allowValues(vals, { min, max })}
      placeholder={placeholder}
      autoFocus={autoFocus}
      disabled={disabled}
      inputMode="decimal"
      className={cn("text-right font-data-tabular", className)}
    />
  );

  if (!label) return input;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {input}
    </div>
  );
}
