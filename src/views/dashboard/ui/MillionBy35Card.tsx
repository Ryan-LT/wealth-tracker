"use client";

import { useEffect, useMemo, useState } from "react";

import {
  cn,
  DEFAULT_MILESTONE_USD,
  evaluateMilestone35Feasibility,
  formatUsd,
  formatVnd,
  MILESTONE_TARGET_AGE,
} from "@/shared/lib";
import type { GoalFeasibilityTone } from "@/shared/lib";
import { Card, MaterialIcon } from "@/shared/ui";

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
  totalMonthlyIncome: number;
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
      aria-label={`Progress toward milestone: ${clamped}%`}
    >
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
        <div
          className="h-full rounded-full bg-secondary transition-[width] duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="shrink-0 text-label-sm font-semibold tabular-nums text-primary">
        {clamped}%
      </span>
    </div>
  );
}

export function MillionBy35Card({
  currentNetWorth,
  monthlyNetContribution,
  totalMonthlyIncome,
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
      annualRealReturn: config.annualRealRate,
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
      hint = `Projected ${formatVnd(projectedEndingNetWorth)} at age ${MILESTONE_TARGET_AGE} meets the ${formatUsd(config.targetUsd)} goal (≈ ${formatVnd(targetVnd)}) using this real return and monthly net.`;
    } else if (feasible) {
      tone = "steady";
      label = "Tight but possible";
      hint = "Very little runway left; the math still clears the target at the assumed real return.";
    } else {
      tone = "at_risk";
      const gap = targetVnd - projectedEndingNetWorth;
      label = "Below projection";
      hint = `At ${(config.annualRealRate * 100).toFixed(2)}% real and today’s monthly net, trajectory lands near ${formatVnd(projectedEndingNetWorth)} — about ${formatVnd(gap)} shy of ${formatVnd(targetVnd)}.`;
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

  if (loadError) {
    return (
      <Card className="h-full border border-outline-variant/60 p-4">
        <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
          {formatUsd(DEFAULT_MILESTONE_USD)} by {MILESTONE_TARGET_AGE}
        </h3>
        <p className="mt-2 text-label-sm text-error">Could not load milestone settings ({loadError}).</p>
      </Card>
    );
  }

  if (!config || !analysis) {
    return (
      <Card className="h-full border border-outline-variant/60 p-4">
        <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
          Milestone
        </h3>
        <p className="mt-2 animate-pulse text-label-sm text-on-surface-variant">Loading…</p>
      </Card>
    );
  }

  const goalTitle = formatUsd(analysis.targetUsd);

  if (analysis.kind === "incomplete") {
    return (
      <Card className="h-full border border-outline-variant/60 p-4">
        <div className="flex h-full min-h-0 flex-col justify-between gap-3">
          <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            {goalTitle} by age {MILESTONE_TARGET_AGE}
          </h3>
          <p className="text-label-sm text-on-surface-variant">
            {analysis.missing === "USER_DATE_OF_BIRTH" &&
              "Add USER_DATE_OF_BIRTH=YYYY-MM-DD to .env.local for your age‑35 deadline and progress."}
            {analysis.missing === "FX_RATE" &&
              "Add EXCHANGERATE_API_KEY (https://www.exchangerate-api.com/docs/standard-requests). Rates are cached in Postgres for 24h—run db/schema.sql and set DATABASE_URL. Or set USD_VND_RATE for a manual VND-per-USD override."}
          </p>
        </div>
      </Card>
    );
  }

  if (analysis.kind === "achieved") {
    return (
      <Card className="h-full border border-outline-variant/60 p-4">
        <div className="flex h-full min-h-0 flex-col justify-between gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              {goalTitle} by age {MILESTONE_TARGET_AGE}
            </h3>
            <span
              className={cn(
                "inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                feasibilityChipClass("achieved"),
              )}
              title="Net worth already meets the converted target."
            >
              <MaterialIcon name={feasibilityIcon("achieved")} size={14} className="shrink-0" />
              <span className="min-w-0 truncate">Target met</span>
            </span>
          </div>
          <p className="text-headline-md font-headline-md leading-tight tracking-tight text-primary tabular-nums">
            {formatVnd(currentNetWorth)}
          </p>
          <GoalProgressLinear percent={analysis.pct} />
          <p className="text-label-sm text-on-surface-variant tabular-nums">
            Income (mo) {formatVnd(totalMonthlyIncome)} · Net (mo) {formatVnd(monthlyNetContribution)}
          </p>
        </div>
      </Card>
    );
  }

  if (analysis.kind === "past_deadline") {
    return (
      <Card className="h-full border border-outline-variant/60 p-4">
        <div className="flex h-full min-h-0 flex-col justify-between gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              {goalTitle} by age {MILESTONE_TARGET_AGE}
            </h3>
            <span
              className={cn(
                "inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                feasibilityChipClass("at_risk"),
              )}
              title="The age 35 deadline from your birth date has passed."
            >
              <MaterialIcon name={feasibilityIcon("at_risk")} size={14} className="shrink-0" />
              <span className="min-w-0 truncate">Past milestone</span>
            </span>
          </div>
          <GoalProgressLinear percent={analysis.pct} />
          <p className="text-label-sm text-on-surface-variant">
            At deadline you were tracking {analysis.pct}% of {formatVnd(analysis.targetVnd)} (≈ {goalTitle}
            ).
          </p>
        </div>
      </Card>
    );
  }

  const { tone, label, hint, pct, projectedEndingNetWorth, monthsRemaining } = analysis;

  return (
    <Card className="h-full border border-outline-variant/60 p-4">
      <div className="flex h-full min-h-0 flex-col justify-between gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-outline-variant/40 pb-2">
          <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            {goalTitle} by age {MILESTONE_TARGET_AGE}
          </h3>
          <span
            className={cn(
              "inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
              feasibilityChipClass(tone),
            )}
            title={hint}
          >
            <MaterialIcon name={feasibilityIcon(tone)} size={14} className="shrink-0" />
            <span className="min-w-0 truncate">{label}</span>
          </span>
        </div>
        <p className="text-headline-md font-headline-md leading-tight tracking-tight text-primary tabular-nums">
          {formatVnd(currentNetWorth)}
        </p>
        <p className="text-label-sm text-on-surface-variant tabular-nums">
          Target ≈ {formatVnd(analysis.targetVnd)} ({goalTitle})
        </p>
        <GoalProgressLinear percent={pct} />
        <p className="text-label-sm text-on-surface-variant">
          Projected at {MILESTONE_TARGET_AGE}:{" "}
          <span className="font-data-tabular font-semibold text-primary tabular-nums">
            {formatVnd(projectedEndingNetWorth)}
          </span>
          <span className="text-on-surface-variant"> · {monthsRemaining.toFixed(1)} mo left</span>
        </p>
        <p className="text-label-sm text-on-surface-variant tabular-nums">
          Income (mo) {formatVnd(totalMonthlyIncome)} · Net (mo) {formatVnd(monthlyNetContribution)}
        </p>
      </div>
    </Card>
  );
}
