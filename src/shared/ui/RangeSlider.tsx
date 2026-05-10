"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/shared/lib";

type RangeSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Right-aligned number formatter (e.g. formatVnd) — receives the current value. */
  format?: (v: number) => ReactNode;
  /** Optional min/max axis labels rendered under the rail. */
  minLabel?: string;
  maxLabel?: string;
  onChange: (next: number) => void;
  className?: string;
};

export function RangeSlider({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  minLabel,
  maxLabel,
  onChange,
  className,
}: RangeSliderProps) {
  const id = useId();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(Number(e.target.value));
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-label-sm font-label-sm text-on-surface-variant">
          {label}
        </label>
        <span className="text-data-tabular font-data-tabular text-on-surface font-bold">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full accent-secondary cursor-pointer"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-on-surface-variant font-data-tabular">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
