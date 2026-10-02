import {
  Activity,
  CircleCheck,
  CircleHelp,
  Eye,
  Gauge,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import type { GoalFeasibility, GoalFeasibilityTone } from "@/entities/goal/lib/feasibility";
import { useI18n } from "@/shared/i18n";
import type { StatusTone } from "@/shared/lib/tone";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/kit/tooltip";

export function feasibilityToneMeta(tone: GoalFeasibilityTone): { status: StatusTone; icon: LucideIcon } {
  switch (tone) {
    case "achieved":
      return { status: "success", icon: CircleCheck };
    case "on_track":
      return { status: "success", icon: TrendingUp };
    case "steady":
      return { status: "neutral", icon: Activity };
    case "watch":
      return { status: "warning", icon: Eye };
    case "tight":
      return { status: "warning", icon: Gauge };
    case "at_risk":
      return { status: "danger", icon: TriangleAlert };
    default:
      return { status: "neutral", icon: CircleHelp };
  }
}

/** Feasibility label with icon; the longer hint shows on hover / focus. */
export function FeasibilityBadge({
  tone,
  code,
  showHint = true,
  interactive = true,
  className,
}: Pick<GoalFeasibility, "tone" | "code"> & {
  /** Show the longer explanation on hover / focus. */
  showHint?: boolean;
  /** `false` inside clickable rows: the hint becomes a plain title (no nested focus target). */
  interactive?: boolean;
  className?: string;
}) {
  const meta = feasibilityToneMeta(tone);
  const { t } = useI18n();
  const { label, hint: fullHint } = t.domain.feasibility[code];
  const hint = showHint ? fullHint : undefined;
  const badge = (
    <StatusBadge tone={meta.status} icon={meta.icon} className={className} title={interactive ? undefined : hint}>
      {label}
    </StatusBadge>
  );
  if (!hint || !interactive) return badge;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
          {badge}
        </span>
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}
