"use client";

import type { ReactNode } from "react";

import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeTone =
  | "success"
  | "neutral"
  | "subtle"
  | "active"
  | "passive"
  | "tag"
  | "danger";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success:
    "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  active: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  passive: "border-transparent bg-muted text-muted-foreground",
  neutral: "border-transparent bg-muted text-muted-foreground",
  subtle: "bg-background text-muted-foreground",
  tag: "bg-background text-muted-foreground",
  danger:
    "border-transparent bg-destructive/15 text-destructive",
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
  const variant: "default" | "secondary" | "destructive" | "outline" =
    tone === "subtle" || tone === "tag" ? "outline" : "secondary";

  return (
    <ShadcnBadge
      variant={variant}
      className={cn(
        "rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wider",
        uppercase && "uppercase",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </ShadcnBadge>
  );
}
