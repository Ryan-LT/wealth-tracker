import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import type { StatusTone } from "@/shared/lib/tone";
import { Badge } from "@/shared/ui/kit/badge";

const toneVariant: Record<StatusTone, "neutral" | "success" | "warning" | "danger" | "info"> = {
  neutral: "neutral",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
};

const dotClass: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

type StatusBadgeProps = {
  tone?: StatusTone;
  icon?: LucideIcon;
  /** Small coloured dot instead of an icon. */
  dot?: boolean;
  title?: string;
  className?: string;
  children: ReactNode;
};

/** Status is never colour alone: always text, plus an optional icon or dot. */
export function StatusBadge({ tone = "neutral", icon: Icon, dot, title, className, children }: StatusBadgeProps) {
  return (
    <Badge variant={toneVariant[tone]} title={title} className={className}>
      {Icon ? <Icon aria-hidden /> : dot ? <span aria-hidden className={cn("size-1.5 rounded-full", dotClass[tone])} /> : null}
      {children}
    </Badge>
  );
}

export type { StatusTone };
