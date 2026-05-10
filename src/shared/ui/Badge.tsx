"use client";

import Chip from "@mui/material/Chip";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

type BadgeTone =
  | "success"
  | "neutral"
  | "subtle"
  | "active"
  | "passive"
  | "tag"
  | "danger";

const TONE_SX: Record<
  BadgeTone,
  { bgcolor?: string; color?: string; border?: string }
> = {
  success: {
    bgcolor: "rgba(0, 108, 73, 0.1)",
    color: "var(--color-secondary)",
  },
  active: {
    bgcolor: "var(--color-secondary-container)",
    color: "var(--color-on-secondary-container)",
  },
  passive: {
    bgcolor: "var(--color-surface-variant)",
    color: "var(--color-on-surface-variant)",
  },
  neutral: {
    bgcolor: "var(--color-surface-container-high)",
    color: "var(--color-on-surface-variant)",
  },
  subtle: {
    bgcolor: "var(--color-surface)",
    color: "var(--color-on-surface-variant)",
    border: "1px solid var(--color-outline-variant)",
  },
  tag: {
    bgcolor: "var(--color-surface)",
    color: "var(--color-on-surface-variant)",
    border: "1px solid var(--color-outline-variant)",
  },
  danger: {
    bgcolor: "var(--color-error-container)",
    color: "var(--color-on-error-container)",
  },
};

type BadgeProps = {
  tone?: BadgeTone;
  uppercase?: boolean;
  className?: string;
  children: ReactNode;
};

export function Badge({
  tone = "neutral",
  uppercase = false,
  className,
  children,
}: BadgeProps) {
  const sx = TONE_SX[tone];

  return (
    <Chip
      label={children}
      size="small"
      variant={tone === "subtle" || tone === "tag" ? "outlined" : "filled"}
      className={cn("font-label-sm tracking-wider", className)}
      sx={{
        height: "auto",
        py: 0.25,
        px: 0.5,
        "& .MuiChip-label": {
          px: 0.5,
          fontSize: "0.75rem",
          lineHeight: "1rem",
          textTransform: uppercase ? "uppercase" : "none",
        },
        ...sx,
        ...(tone === "subtle" || tone === "tag"
          ? {
              bgcolor: sx.bgcolor,
              borderColor: "var(--color-outline-variant)",
            }
          : {}),
      }}
    />
  );
}
