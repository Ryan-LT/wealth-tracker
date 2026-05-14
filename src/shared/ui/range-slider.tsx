"use client";

import { useId, type ReactNode } from "react";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type RangeSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => ReactNode;
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
  const labelId = useId();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span id={labelId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-semibold font-data-tabular text-foreground">
          {format ? format(value) : value}
        </span>
      </div>
      <Slider
        aria-labelledby={labelId}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? min)}
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-muted-foreground font-data-tabular">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
