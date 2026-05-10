"use client";

import type { ChangeEvent } from "react";
import { useId } from "react";

import { cn } from "@/shared/lib";
import { formatThousands } from "@/shared/lib";

type MoneyInputProps = {
  label?: string;
  value: number;
  onChange: (next: number) => void;
  placeholder?: string;
  className?: string;
  /** "₫" by default; pass empty string to omit. */
  symbol?: string;
  /** Use thousand separators while typing. */
  separated?: boolean;
};

/**
 * VND-style money input with leading "₫" glyph and right-aligned tabular figures.
 * Accepts free-form digits / separators while typing, but stores a clean number.
 */
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
  const display = separated && Number.isFinite(value) ? formatThousands(value) : String(value || "");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^\d-]/g, "");
    const parsed = digits === "" || digits === "-" ? 0 : Number(digits);
    if (!Number.isNaN(parsed)) onChange(parsed);
  }

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="block font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        {symbol ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data-tabular text-data-tabular text-on-surface-variant pointer-events-none">
            {symbol}
          </span>
        ) : null}
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "w-full h-10 pr-3 py-2 border border-outline-variant rounded",
            "focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors",
            "font-data-tabular text-data-tabular text-right bg-surface-container-lowest",
            symbol ? "pl-7" : "pl-3",
          )}
        />
      </div>
    </div>
  );
}
