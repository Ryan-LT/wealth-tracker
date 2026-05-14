import { cn, computeGoalFeasibility, formatVnd, type GoalFeasibilityTone } from "@/shared/lib";
import { Card, MaterialIcon } from "@/shared/ui";

type PrimaryGoalCardProps = {
  /** Small heading above the plan name (e.g. “Goal plan”). */
  cardLabel?: string;
  name: string;
  targetAmount: number;
  saved: number;
  /** Label for the bottom amount line (default “Saved”). */
  savedCaption?: string;
  /** ISO target date from the plan (enables runway vs calendar checks). */
  targetDate?: string;
  /** When false, feasibility ignores household monthly net for this plan. */
  includeMonthlyIncome?: boolean;
  /** Household estimated monthly net (preferences + income sources). */
  estimatedMonthlyNet?: number;
};

function feasibilityIcon(tone: GoalFeasibilityTone): string {
  switch (tone) {
    case "achieved":
      return "check_circle";
    case "on_track":
      return "trending_up";
    case "steady":
      return "show_chart";
    case "watch":
      return "insights";
    case "tight":
      return "percent";
    case "at_risk":
      return "error";
    default:
      return "help_outline";
  }
}

function feasibilityChipClass(tone: GoalFeasibilityTone): string {
  switch (tone) {
    case "achieved":
      return "border-secondary/45 bg-secondary/12 text-secondary";
    case "on_track":
      return "border-secondary/35 bg-secondary/[0.07] text-secondary";
    case "steady":
      return "border-outline-variant bg-surface-container text-on-surface-variant";
    case "watch":
      return "border-amber-600/35 bg-amber-500/[0.09] text-amber-950";
    case "tight":
      return "border-orange-600/40 bg-orange-500/[0.1] text-orange-950";
    case "at_risk":
      return "border-error/45 bg-error-container/50 text-error";
    default:
      return "border-outline-variant bg-surface-container-high text-on-surface-variant";
  }
}

function GoalProgressLinear({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="flex min-w-0 items-center gap-2"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress toward goal: ${percent}%`}
    >
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
        <div
          className="h-full rounded-full bg-secondary transition-[width] duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="shrink-0 text-label-sm font-semibold tabular-nums text-primary">
        {percent}%
      </span>
    </div>
  );
}

export function PrimaryGoalCard({
  cardLabel = "Goal plan",
  name,
  targetAmount,
  saved,
  savedCaption = "Saved",
  targetDate = "",
  includeMonthlyIncome = true,
  estimatedMonthlyNet = 0,
}: PrimaryGoalCardProps) {
  const pct =
    targetAmount === 0 ? 0 : Math.round((saved / targetAmount) * 100);

  const pulse = computeGoalFeasibility({
    saved,
    targetAmount,
    targetDateIso: targetDate,
    includeMonthlyIncome,
    estimatedMonthlyNet,
  });

  return (
    <Card className="flex h-full min-h-0 flex-col border border-outline-variant/60 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/40 pb-2">
        <span className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
          {cardLabel}
        </span>
        <span
          className={cn(
            "inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
            feasibilityChipClass(pulse.tone),
          )}
          title={pulse.hint}
        >
          <MaterialIcon name={feasibilityIcon(pulse.tone)} size={14} className="shrink-0" />
          <span className="min-w-0 truncate">{pulse.label}</span>
        </span>
      </div>
      <p className="line-clamp-2 min-h-0 text-body-lg font-semibold leading-snug text-primary">
        {name}
      </p>
      <p className="mt-0.5 text-label-sm text-on-surface-variant tabular-nums">
        Target {formatVnd(targetAmount)}
      </p>
      <div className="mt-2">
        <GoalProgressLinear percent={pct} />
      </div>
      <p className="mt-2 text-label-sm text-on-surface-variant tabular-nums">
        <span className="font-data-tabular font-semibold text-primary">
          {formatVnd(saved)}
        </span>{" "}
        {savedCaption}
      </p>
    </Card>
  );
}
