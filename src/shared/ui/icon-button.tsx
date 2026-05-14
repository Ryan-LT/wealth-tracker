"use client";

import type { ButtonHTMLAttributes } from "react";

import MuiIconButton from "@mui/material/IconButton";

import { cn } from "@/shared/lib";

import { MaterialIcon } from "./material-icon";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  icon: string;
  label: string;
  filled?: boolean;
  size?: number;
};

/**
 * Round icon button used for top bar actions and inline row controls.
 */
export function IconButton({
  icon,
  label,
  filled,
  size,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <MuiIconButton
      type="button"
      aria-label={label}
      className={cn(
        "text-on-surface-variant hover:bg-surface-container-low transition-colors",
        className,
      )}
      sx={{
        width: 40,
        height: 40,
      }}
      {...rest}
    >
      <MaterialIcon name={icon} filled={filled} size={size ?? 24} />
    </MuiIconButton>
  );
}
