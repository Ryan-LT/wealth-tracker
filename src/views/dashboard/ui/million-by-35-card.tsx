"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib";
import {
  DEFAULT_MILESTONE_USD,
  evaluateMilestone35Feasibility,
  formatUsd,
  formatVnd,
  MILESTONE_TARGET_AGE,
  type GoalFeasibilityTone,
} from "@/shared/lib";
import { MaterialIcon } from "@/shared/ui";

type MilestoneConfigOk = {
  ok: true;
  deadlineIso: string;
  targetUsd: number;
  targetVnd: number;
  vndPerUsd: number;
  annualRealRate: number;
  realRateSource: "default" | "env";
  vndPerUsdSource: "env" | "cache" | "exchangerate-api" | "stale_cache" | null;
  fxFetchedAtIso: string | null;
  fxApiLastUpdateIso: string | null;
};

type MilestoneConfigPartial = {
  ok: false;
  missing: "USER_DATE_OF_BIRTH" | "FX_RATE";
  annualRealRate: number;
  realRateSource: "default" | "env";
  targetUsd: number;
  targetVnd: number | null;
  vndPerUsd: number | null;
  deadlineIso?: string;
  vndPerUsdSource: "env" | "cache" | "exchangerate-api" | "stale_cache" | null;
  fxFetchedAtIso: string | null;
  fxApiLastUpdateIso: string | null;
};

type MilestoneConfigResponse = MilestoneConfigOk | MilestoneConfigPartial;

type MillionBy35CardProps = {
  currentNetWorth: number;
  monthlyNetContribution: number;
  /** Page-level hydration flag. When false, render the skeleton variant. */
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

function Chip({ tone, label, title }: { tone: GoalFeasibilityTone; label: string; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        feasibilityChipClass(tone),
      )}
    >
      <MaterialIcon name={feasibilityIcon(tone)} size={12} />
      <span className="truncate">{label}</span>
    </span>
  );
}

export function MillionBy35Card({
  currentNetWorth,
  monthlyNetContribution,
  loading = false,
}: MillionBy35CardProps) {
  const [config, setConfig] = useState<MilestoneConfigResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/finance/milestone-35-config");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as MilestoneConfigResponse;
        if (!cancelled) {
          setConfig(data);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Could not load milestone settings");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const analysis = useMemo(() => {
    if (!config || loadError) return null;
    const now = new Date();

    if (!config.ok) {
      return {
        kind: "incomplete" as const,
        targetUsd: config.targetUsd,
        missing: config.missing,
      };
    }

    const deadline = new Date(config.deadlineIso);
    const targetVnd = config.targetVnd;
    const pastDeadline = deadline.getTime() < now.getTime();
    const pct =
      targetVnd === 0 ? 0 : Math.min(100, Math.round((currentNetWorth / targetVnd) * 100));

    if (currentNetWorth >= targetVnd) {
      return {
        kind: "achieved" as const,
        targetUsd: config.targetUsd,
        targetVnd,
        pct,
        pastDeadline,
        deadline,
      };
    }

    if (pastDeadline) {
      return {
        kind: "past_deadline" as const,
        targetUsd: config.targetUsd,
        targetVnd,
        pct,
        deadline,
      };
    }

    const { projectedEndingNetWorth, feasible, monthsRemaining } = evaluateMilestone35Feasibility({
      currentNetWorth,
      monthlyNetContribution,
      targetNetWorthVnd: targetVnd,
      deadline,
      now,
    });

    let tone: GoalFeasibilityTone;
    let label: string;
    let hint: string;

    if (feasible && monthsRemaining > 1) {
      tone = "on_track";
      label = "On track";
      hint = `Projected ${formatVnd(projectedEndingNetWorth)} at age ${MILESTONE_TARGET_AGE} from current monthly net meets the ${formatUsd(config.targetUsd)} goal (≈ ${formatVnd(targetVnd)}).`;
    } else if (feasible) {
      tone = "steady";
      label = "Tight but possible";
      hint = "Very little runway left.";
    } else {
      tone = "at_risk";
      const gap = targetVnd - projectedEndingNetWorth;
      label = "Below projection";
      hint = `Trajectory lands near ${formatVnd(projectedEndingNetWorth)} — about ${formatVnd(gap)} shy.`;
    }

    return {
      kind: "projection" as const,
      targetUsd: config.targetUsd,
      targetVnd,
      pct,
      projectedEndingNetWorth,
      feasible,
      monthsRemaining,
      tone,
      label,
      hint,
      deadline,
    };
  }, [config, loadError, currentNetWorth, monthlyNetContribution]);

  if (loading) {
    return (
      <Card className="card-hero h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {formatUsd(DEFAULT_MILESTONE_USD)} by {MILESTONE_TARGET_AGE}
          </CardTitle>
          <Skeleton className="h-5 w-20 rounded-full" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-2xl font-bold leading-8">
            <Skeleton className="h-7 w-40 inline-block align-middle" />
          </p>
          <p className="text-xs text-muted-foreground leading-4">
            <Skeleton className="h-3 w-48 inline-block align-middle" />
          </p>
          <Progress value={0} />
          <p className="text-xs text-muted-foreground leading-4">
            <Skeleton className="h-3 w-56 inline-block align-middle" />
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="card-hero h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {formatUsd(DEFAULT_MILESTONE_USD)} by {MILESTONE_TARGET_AGE}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Could not load milestone settings ({loadError}).</p>
        </CardContent>
      </Card>
    );
  }

  if (!config || !analysis) {
    return (
      <Card className="card-hero h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Milestone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="animate-pulse text-sm text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    );
  }

  const goalTitle = formatUsd(analysis.targetUsd);

  if (analysis.kind === "incomplete") {
    return (
      <Card className="card-hero h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {goalTitle} by age {MILESTONE_TARGET_AGE}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {analysis.missing === "USER_DATE_OF_BIRTH" &&
              "Add USER_DATE_OF_BIRTH=YYYY-MM-DD to .env.local for your age-35 deadline."}
            {analysis.missing === "FX_RATE" &&
              "Add EXCHANGERATE_API_KEY for FX rates. Rates are cached in Postgres for 24h."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (analysis.kind === "achieved") {
    return (
      <Card className="card-hero h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {goalTitle} by age {MILESTONE_TARGET_AGE}
          </CardTitle>
          <Chip tone="achieved" label="Target met" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-2xl font-bold font-data-tabular tabular-nums tracking-tight">
            {formatVnd(currentNetWorth)}
          </p>
          <Progress value={analysis.pct} />
        </CardContent>
      </Card>
    );
  }

  if (analysis.kind === "past_deadline") {
    return (
      <Card className="card-hero h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {goalTitle} by age {MILESTONE_TARGET_AGE}
          </CardTitle>
          <Chip tone="at_risk" label="Past milestone" title="Age 35 deadline passed." />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Progress value={analysis.pct} />
          <p className="text-xs text-muted-foreground">
            At deadline you were tracking {analysis.pct}% of {formatVnd(analysis.targetVnd)} (≈ {goalTitle}).
          </p>
        </CardContent>
      </Card>
    );
  }

  const { tone, label, hint, pct, projectedEndingNetWorth, monthsRemaining } = analysis;

  return (
    <Card className="card-hero h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {goalTitle} by age {MILESTONE_TARGET_AGE}
        </CardTitle>
        <Chip tone={tone} label={label} title={hint} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-2xl font-bold font-data-tabular tabular-nums tracking-tight">
          {formatVnd(currentNetWorth)}
        </p>
        <p className="text-xs text-muted-foreground font-data-tabular tabular-nums">
          Target ≈ {formatVnd(analysis.targetVnd)} ({goalTitle})
        </p>
        <Progress value={pct} />
        <p className="text-xs text-muted-foreground">
          Projected at {MILESTONE_TARGET_AGE}:{" "}
          <span className="font-semibold text-foreground font-data-tabular tabular-nums">
            {formatVnd(projectedEndingNetWorth)}
          </span>{" "}
          · {monthsRemaining.toFixed(1)} mo left
        </p>
      </CardContent>
    </Card>
  );
}
