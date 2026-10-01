"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";

type SegmentedControlProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: { value: T; label: string; icon?: LucideIcon }[];
  "aria-label"?: string;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  className?: string;
};

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  fullWidth,
  className,
  ...rest
}: SegmentedControlProps<T>) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as T)} className={cn(fullWidth && "w-full", className)}>
      <TabsList aria-label={rest["aria-label"]} className={cn(fullWidth && "w-full")}>
        {options.map((o) => (
          <TabsTrigger key={o.value} value={o.value}>
            {o.icon ? <o.icon aria-hidden /> : null}
            {o.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
