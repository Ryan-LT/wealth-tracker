"use client";

import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "color"> & {
  label?: string;
  inputSize?: "sm" | "md";
  startAdornment?: ReactNode;
  containerClassName?: string;
  alignRight?: boolean;
};

export function Input({
  label,
  inputSize = "md",
  startAdornment,
  containerClassName,
  className,
  alignRight = false,
  ...rest
}: InputProps) {
  return (
    <TextField
      label={label}
      size={inputSize === "sm" ? "small" : "medium"}
      fullWidth
      variant="outlined"
      className={cn(containerClassName)}
      slotProps={{
        input: {
          startAdornment: startAdornment ? (
            <InputAdornment position="start">
              <span className="font-data-tabular text-data-tabular text-on-surface-variant">
                {startAdornment}
              </span>
            </InputAdornment>
          ) : undefined,
          className: cn(className),
        },
      }}
      sx={{
        "& .MuiInputLabel-root": {
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "var(--color-on-surface-variant)",
        },
        ...(alignRight && {
          "& input": {
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          },
        }),
      }}
      {...rest}
    />
  );
}
