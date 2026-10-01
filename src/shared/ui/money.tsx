"use client";

import { useState } from "react";

import { cn } from "@/shared/lib/cn";
import { formatMoney, formatMoneyCompact } from "@/shared/lib/format";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/kit/tooltip";

export type MoneyTone = "none" | "auto" | "success" | "danger" | "muted";

type MoneyProps = {
  value: number;
  /** Compact form (`4,82B ₫`); hover shows the full value, tap toggles it. */
  compact?: boolean;
  /** Prefix "+" on positive values. */
  signed?: boolean;
  /** `auto` colours positive green and negative red. */
  tone?: MoneyTone;
  strike?: boolean;
  className?: string;
};

function toneClass(tone: MoneyTone, value: number): string | undefined {
  switch (tone) {
    case "success":
      return "text-success";
    case "danger":
      return "text-danger";
    case "muted":
      return "text-muted-foreground";
    case "auto":
      return value > 0 ? "text-success" : value < 0 ? "text-danger" : undefined;
    default:
      return undefined;
  }
}

/** Every VND amount in the UI goes through this component. */
export function Money({ value, compact, signed, tone = "none", strike, className }: MoneyProps) {
  const signDisplay = signed ? "exceptZero" : "auto";
  const full = formatMoney(value, { signDisplay });
  const [expanded, setExpanded] = useState(false);
  const classes = cn(
    "whitespace-nowrap tabular-nums",
    toneClass(tone, value),
    strike && "line-through decoration-muted-foreground/60",
    className,
  );

  if (!compact) {
    return <span className={classes}>{full}</span>;
  }

  const short = formatMoneyCompact(value, { signDisplay });
  if (short === full) return <span className={classes}>{full}</span>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={full}
          className={cn(classes, "cursor-help rounded-sm text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring")}
        >
          {expanded ? full : short}
        </button>
      </TooltipTrigger>
      <TooltipContent>{full}</TooltipContent>
    </Tooltip>
  );
}
