"use client";

import MuiButton from "@mui/material/Button";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

type Variant = "primary" | "secondary" | "ghost" | "outline-secondary";
type Size = "sm" | "md";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  startIcon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  startIcon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";
  const isOutlineSecondary = variant === "outline-secondary";

  return (
    <MuiButton
      type={rest.type ?? "button"}
      disabled={disabled}
      variant={
        isGhost ? "text" : isPrimary ? "contained" : "outlined"
      }
      color={
        isPrimary
          ? "secondary"
          : isOutlineSecondary
            ? "secondary"
            : "inherit"
      }
      size={size === "sm" ? "small" : "medium"}
      startIcon={startIcon}
      disableElevation
      className={cn("active:opacity-80", className)}
      sx={{
        width: block ? "100%" : undefined,
        ...(variant === "secondary" && {
          borderColor: "var(--color-outline-variant)",
          color: "var(--color-primary)",
          bgcolor: "var(--color-surface)",
          "&:hover": {
            bgcolor: "var(--color-surface-container-low)",
            borderColor: "var(--color-outline-variant)",
          },
        }),
        ...(isGhost && {
          color: "var(--color-on-surface-variant)",
          "&:hover": {
            bgcolor: "var(--color-surface-container-low)",
          },
        }),
      }}
      {...rest}
    >
      {children}
    </MuiButton>
  );
}
