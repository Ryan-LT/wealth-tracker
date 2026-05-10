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

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-secondary/10 text-secondary",
  active: "bg-secondary-container text-on-secondary-container",
  passive: "bg-surface-variant text-on-surface-variant",
  neutral: "bg-surface-container-high text-on-surface-variant",
  subtle:
    "bg-surface border border-outline-variant text-on-surface-variant",
  tag: "bg-surface border border-outline-variant text-on-surface-variant",
  danger: "bg-error-container text-on-error-container",
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
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded font-label-sm text-label-sm tracking-wider whitespace-nowrap",
        uppercase && "uppercase",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
