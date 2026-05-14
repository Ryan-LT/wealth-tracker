"use client";

import type { ButtonHTMLAttributes } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { MaterialIcon } from "./material-icon";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  icon: string;
  label: string;
  filled?: boolean;
  size?: number;
};

export function IconButton({
  icon,
  label,
  filled: _filled,
  size,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      className={cn("rounded-full", className)}
      {...rest}
    >
      <MaterialIcon name={icon} size={size ?? 18} />
    </Button>
  );
}
