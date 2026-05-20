import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib";
import { computeGoalFeasibility, formatVnd, type GoalFeasibilityTone } from "@/shared/lib";
import { MaterialIcon } from "@/shared/ui";

type PrimaryGoalCardProps = {
  cardLabel?: string;
  name: string;
  targetAmount: number;
  saved: number;
  savedCaption?: string;
  targetDate?: string;
  includeMonthlyIncome?: boolean;
  estimatedMonthlyNet?: number;
  loading?: boolean;
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
    case "on_track":
      return "border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "steady":
      return "border-border bg-muted text-muted-foreground";
    case "watch":
      return "border-amber-600/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "tight":
      return "border-orange-600/40 bg-orange-500/10 text-orange-700 dark:text-orange-300";
    case "at_risk":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
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
  loading = false,
}: PrimaryGoalCardProps) {
  const pct = targetAmount === 0 ? 0 : Math.round((saved / targetAmount) * 100);

  const pulse = computeGoalFeasibility({
    saved,
    targetAmount,
    targetDateIso: targetDate,
    includeMonthlyIncome,
    estimatedMonthlyNet,
  });

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {cardLabel}
        </CardTitle>
        {loading ? (
          <Skeleton className="h-5 w-20 rounded-full" />
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
              feasibilityChipClass(pulse.tone),
            )}
            title={pulse.hint}
          >
            <MaterialIcon name={feasibilityIcon(pulse.tone)} size={12} />
            <span className="truncate">{pulse.label}</span>
          </span>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <p className="line-clamp-2 text-base font-semibold leading-6 min-h-12">
          {loading ? <Skeleton className="h-5 w-3/4 inline-block align-middle" /> : name}
        </p>
        <p className="text-xs text-muted-foreground font-data-tabular tabular-nums leading-4">
          {loading ? (
            <Skeleton className="h-3 w-32 inline-block align-middle" />
          ) : (
            <>Target {formatVnd(targetAmount)}</>
          )}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <Progress value={loading ? 0 : Math.min(100, Math.max(0, pct))} className="h-2" />
          <span className="shrink-0 text-xs font-semibold tabular-nums leading-4 w-8 text-right">
            {loading ? <Skeleton className="h-3 w-6 inline-block align-middle" /> : `${pct}%`}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-data-tabular tabular-nums leading-4">
          {loading ? (
            <Skeleton className="h-3 w-40 inline-block align-middle" />
          ) : (
            <>
              <span className="font-semibold text-foreground">{formatVnd(saved)}</span> {savedCaption}
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
