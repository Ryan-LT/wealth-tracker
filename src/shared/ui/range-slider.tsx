"use client";

import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/shared/lib";

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
  const sliderId = useId();

  return (
    <Box className={cn("flex flex-col gap-2", className)}>
      <div className="flex justify-between items-center gap-2">
        <Typography
          id={labelId}
          component="span"
          className="text-label-sm font-label-sm text-on-surface-variant"
        >
          {label}
        </Typography>
        <span className="text-data-tabular font-data-tabular text-on-surface font-bold">
          {format ? format(value) : value}
        </span>
      </div>
      <Slider
        id={sliderId}
        aria-labelledby={labelId}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, v) => onChange(v as number)}
        color="secondary"
        size="medium"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-on-surface-variant font-data-tabular">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </Box>
  );
}
