"use client";

import { NumericFormat, type NumberFormatValues } from "react-number-format";

import { Input as ShadcnInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type MoneyInputProps = {
  label?: string;
  value: number;
  onChange: (next: number) => void;
  placeholder?: string;
  className?: string;
  symbol?: string;
  decimals?: number;
  allowNegative?: boolean;
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
  opts: { allowNegative: boolean; min?: number; max?: number },
): boolean {
  const v = values.floatValue;
  if (v === undefined) return true;
  if (!opts.allowNegative && v < 0) return false;
  if (opts.min !== undefined && v < opts.min) return false;
  if (opts.max !== undefined && v > opts.max) return false;
  return true;
}

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
  autoFocus,
  disabled,
  id,
}: MoneyInputProps) {
  const safeValue = Number.isFinite(value) ? value : 0;

  const input = (
    <div className="relative">
      {symbol && (
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-data-tabular">
          {symbol}
        </span>
      )}
      <NumericFormat
        id={id}
        customInput={ShadcnInput}
        thousandSeparator=","
        decimalScale={decimals}
        fixedDecimalScale={decimals > 0}
        allowNegative={allowNegative}
        value={safeValue}
        onValueChange={(vals) => onChange(vals.floatValue ?? 0)}
        isAllowed={(vals) => allowValues(vals, { allowNegative, min, max })}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        inputMode="decimal"
        className={cn(
          "text-right font-data-tabular",
          symbol ? "pl-7" : "",
          className,
        )}
      />
    </div>
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
