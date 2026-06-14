"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib";
import { onAppForeground } from "@/shared/lib/app-foreground";
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

function formatAheadOfTarget(projected: number, target: number): {
  surplus: number;
  pctLabel: string;
  moneyLabel: string;
} {
  const surplus = projected - target;
  const pct = target > 0 ? (surplus / target) * 100 : 0;
  return {
    surplus,
    pctLabel: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`,
    moneyLabel: formatVnd(Math.abs(surplus), { showSign: surplus >= 0 }),
  };
}

function Chip({
  tone,
  label,
  detail,
  title,
}: {
  tone: GoalFeasibilityTone;
  label: string;
  detail?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex max-w-[min(100%,14rem)] flex-col items-end gap-0.5 rounded-lg border px-3 py-1.5 text-end",
        feasibilityChipClass(tone),
      )}
    >
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide">
        <MaterialIcon name={feasibilityIcon(tone)} size={12} />
        <span className="truncate">{label}</span>
      </span>
      {detail ? (
        <span className="truncate text-[10px] font-semibold normal-case tracking-normal font-data-tabular tabular-nums">
          {detail}
        </span>
      ) : null}
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

    const loadConfig = async () => {
      try {
        const res = await fetch("/api/finance/milestone-35-config", {
          cache: "no-store",
        });
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
    };

    void loadConfig();
    const removeForeground = onAppForeground(() => {
      void loadConfig();
    });
    return () => {
      cancelled = true;
      removeForeground();
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
      const ahead = formatAheadOfTarget(currentNetWorth, targetVnd);
      return {
        kind: "achieved" as const,
        targetUsd: config.targetUsd,
        targetVnd,
        pct,
        pastDeadline,
        deadline,
        chipDetail: `${ahead.pctLabel} · ${ahead.moneyLabel}`,
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

    const ahead = formatAheadOfTarget(projectedEndingNetWorth, targetVnd);

    if (feasible && monthsRemaining > 1) {
      tone = "on_track";
      label = "On track";
      hint = `Projected ${formatVnd(projectedEndingNetWorth)} at age ${MILESTONE_TARGET_AGE} — ${ahead.pctLabel} (${ahead.moneyLabel}) above the ${formatUsd(config.targetUsd)} goal (≈ ${formatVnd(targetVnd)}).`;
    } else if (feasible) {
      tone = "steady";
      label = "Tight but possible";
      hint = `Projected ${formatVnd(projectedEndingNetWorth)} — ${ahead.pctLabel} (${ahead.moneyLabel}) above target with very little runway left.`;
    } else {
      tone = "at_risk";
      const gap = targetVnd - projectedEndingNetWorth;
      const shortPct = targetVnd > 0 ? ((gap / targetVnd) * 100).toFixed(1) : "0";
      label = "Below projection";
      hint = `Trajectory lands near ${formatVnd(projectedEndingNetWorth)} — about ${formatVnd(gap)} (${shortPct}%) below target.`;
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
      chipDetail: feasible ? `${ahead.pctLabel} · ${ahead.moneyLabel}` : undefined,
      deadline,
    };
  }, [config, loadError, currentNetWorth, monthlyNetContribution]);

  if (loading) {
    return (
      <Card variant="heroBlue" className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-3 pb-3">
          <CardTitle className="text-sm font-medium text-[var(--surface-hero-muted)]">
            {formatUsd(DEFAULT_MILESTONE_USD)} by {MILESTONE_TARGET_AGE}
          </CardTitle>
          <Skeleton className="h-5 w-20 rounded-full" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
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
      <Card variant="heroBlue" className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[var(--surface-hero-muted)]">
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
      <Card variant="heroBlue" className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[var(--surface-hero-muted)]">
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
      <Card variant="heroBlue" className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[var(--surface-hero-muted)]">
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
      <Card variant="heroBlue" className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-3 pb-3">
          <CardTitle className="text-sm font-medium text-[var(--surface-hero-muted)]">
            {goalTitle} by age {MILESTONE_TARGET_AGE}
          </CardTitle>
          <Chip
            tone="achieved"
            label="Target met"
            detail={analysis.chipDetail}
            title={
              analysis.chipDetail
                ? `Already ${analysis.chipDetail} above the ${goalTitle} target.`
                : undefined
            }
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
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
      <Card variant="heroBlue" className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-3 pb-3">
          <CardTitle className="text-sm font-medium text-[var(--surface-hero-muted)]">
            {goalTitle} by age {MILESTONE_TARGET_AGE}
          </CardTitle>
          <Chip tone="at_risk" label="Past milestone" title="Age 35 deadline passed." />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Progress value={analysis.pct} />
          <p className="text-xs text-muted-foreground">
            At deadline you were tracking {analysis.pct}% of {formatVnd(analysis.targetVnd)} (≈ {goalTitle}).
          </p>
        </CardContent>
      </Card>
    );
  }

  const { tone, label, hint, pct, projectedEndingNetWorth, monthsRemaining, chipDetail } =
    analysis;

  return (
    <Card variant="heroBlue" className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-3 pb-3">
        <CardTitle className="text-sm font-medium text-[var(--surface-hero-muted)]">
          {goalTitle} by age {MILESTONE_TARGET_AGE}
        </CardTitle>
        <Chip tone={tone} label={label} detail={chipDetail} title={hint} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
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
