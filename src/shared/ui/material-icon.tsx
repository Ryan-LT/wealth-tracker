"use client";

import { createElement } from "react";

import { cn } from "@/lib/utils";

import { resolveSymbolIcon } from "./material-icon-registry";

type MaterialIconProps = {
  name: string;
  filled?: boolean;
  size?: number;
  weight?: number;
  className?: string;
};

export function MaterialIcon({
  name,
  filled: _filled,
  size = 18,
  weight: _weight,
  className,
}: MaterialIconProps) {
  const Icon = resolveSymbolIcon(name);
  return createElement(Icon, {
    className: cn("shrink-0", className),
    width: size,
    height: size,
    "aria-hidden": true,
  });
}
