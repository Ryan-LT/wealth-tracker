"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

import { Input as ShadcnInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "color"> & {
  label?: string;
  inputSize?: "sm" | "md";
  startAdornment?: ReactNode;
  containerClassName?: string;
  alignRight?: boolean;
};

export function Input({
  label,
  inputSize: _inputSize = "md",
  startAdornment,
  containerClassName,
  className,
  alignRight = false,
  id,
  ...rest
}: InputProps) {
  const inputElement = startAdornment ? (
    <div className="relative">
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-data-tabular">
        {startAdornment}
      </span>
      <ShadcnInput
        id={id}
        className={cn("pl-7", alignRight && "text-right font-data-tabular", className)}
        {...rest}
      />
    </div>
  ) : (
    <ShadcnInput
      id={id}
      className={cn(alignRight && "text-right font-data-tabular", className)}
      {...rest}
    />
  );

  if (!label) {
    return <div className={cn(containerClassName)}>{inputElement}</div>;
  }

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {inputElement}
    </div>
  );
}
