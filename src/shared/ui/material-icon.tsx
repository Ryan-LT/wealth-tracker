"use client";

import { createElement, type CSSProperties } from "react";

import { cn } from "@/shared/lib";

import { resolveSymbolIcon } from "./materialIconRegistry";

type MaterialIconProps = {
  name: string;
  filled?: boolean;
  /** Pixel size override; otherwise inherits parent font-size. */
  size?: number;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  className?: string;
};

/**
 * Renders an [@mui/icons-material](https://mui.com/material-ui/material-icons/) SVG.
 * Pass a snake_case **symbol key** that matches `materialIconRegistry.tsx` (e.g. `account_balance`).
 */
export function MaterialIcon({
  name,
  filled = false,
  size,
  weight,
  className,
}: MaterialIconProps) {
  const Icon = resolveSymbolIcon(name, !filled);

  const sx: Record<string, unknown> = {};
  if (size !== undefined) {
    sx.fontSize = size;
    sx.width = size;
    sx.height = size;
  }

  const style: CSSProperties | undefined =
    weight !== undefined ? { fontWeight: weight } : undefined;

  return createElement(Icon, {
    className: cn(className),
    sx,
    style,
    "aria-hidden": true,
    tabIndex: -1,
  });
}
