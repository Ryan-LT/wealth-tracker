import type { GoalFeasibilityTone } from "@/entities/goal";
import type { MilestoneConfigResponse } from "@/entities/milestone/model";
import {
  evaluateMilestone35Feasibility,
  MILESTONE_TARGET_AGE,
} from "@/shared/lib/milestone-35-projection";

export type MilestoneAnalysis =
  | { kind: "incomplete"; targetUsd: number; missing: "USER_DATE_OF_BIRTH" | "FX_RATE" }
  | {
      kind: "achieved";
      targetUsd: number;
      targetVnd: number;
      pct: number;
      deadline: Date;
      pastDeadline: boolean;
      /** Current net worth minus target. */
      surplus: number;
    }
  | {
      kind: "past_deadline";
      targetUsd: number;
      targetVnd: number;
      pct: number;
      deadline: Date;
    }
  | {
      kind: "projection";
      targetUsd: number;
      targetVnd: number;
      pct: number;
      deadline: Date;
      projectedEndingNetWorth: number;
      feasible: boolean;
      monthsRemaining: number;
      tone: GoalFeasibilityTone;
      label: string;
    };

/** Pure state machine behind the "$1M by 35" card. */
export function analyzeMilestone35(input: {
  config: MilestoneConfigResponse;
  currentNetWorth: number;
  monthlyNetContribution: number;
  now?: Date;
}): MilestoneAnalysis {
  const { config, currentNetWorth, monthlyNetContribution } = input;
  const now = input.now ?? new Date();

  if (!config.ok) {
    return { kind: "incomplete", targetUsd: config.targetUsd, missing: config.missing };
  }

  const deadline = new Date(config.deadlineIso);
  const targetVnd = config.targetVnd;
  const pastDeadline = deadline.getTime() < now.getTime();
  const pct =
    targetVnd === 0 ? 0 : Math.min(100, Math.round((currentNetWorth / targetVnd) * 100));

  if (currentNetWorth >= targetVnd) {
    return {
      kind: "achieved",
      targetUsd: config.targetUsd,
      targetVnd,
      pct,
      deadline,
      pastDeadline,
      surplus: currentNetWorth - targetVnd,
    };
  }

  if (pastDeadline) {
    return { kind: "past_deadline", targetUsd: config.targetUsd, targetVnd, pct, deadline };
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
  if (feasible && monthsRemaining > 1) {
    tone = "on_track";
    label = "On track";
  } else if (feasible) {
    tone = "steady";
    label = "Tight but possible";
  } else {
    tone = "at_risk";
    label = "Below projection";
  }

  return {
    kind: "projection",
    targetUsd: config.targetUsd,
    targetVnd,
    pct,
    deadline,
    projectedEndingNetWorth,
    feasible,
    monthsRemaining,
    tone,
    label,
  };
}

export type MilestoneFormatters = {
  /** Full money value; `signed` prefixes "+" for non-negative values. */
  money: (amount: number, opts?: { signed?: boolean }) => string;
  usd: (amount: number) => string;
};

/** "+12.5% · +125.000.000 ₫" style surplus label. */
export function formatAheadOfTarget(
  projected: number,
  target: number,
  fmt: MilestoneFormatters,
): { surplus: number; pctLabel: string; moneyLabel: string; detail: string } {
  const surplus = projected - target;
  const pct = target > 0 ? (surplus / target) * 100 : 0;
  const pctLabel = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  const moneyLabel = fmt.money(Math.abs(surplus), { signed: surplus >= 0 });
  return { surplus, pctLabel, moneyLabel, detail: `${pctLabel} · ${moneyLabel}` };
}

/** Longer explanation for the status badge tooltip. */
export function milestoneHint(a: MilestoneAnalysis, fmt: MilestoneFormatters): string | null {
  switch (a.kind) {
    case "incomplete":
      return a.missing === "USER_DATE_OF_BIRTH"
        ? "Add USER_DATE_OF_BIRTH=YYYY-MM-DD to the server environment for your age-35 deadline."
        : "Add EXCHANGERATE_API_KEY for FX rates. Rates are cached in Postgres for 24h.";
    case "achieved": {
      const ahead = formatAheadOfTarget(a.targetVnd + a.surplus, a.targetVnd, fmt);
      return `Already ${ahead.detail} above the ${fmt.usd(a.targetUsd)} target.`;
    }
    case "past_deadline":
      return `Age ${MILESTONE_TARGET_AGE} deadline passed.`;
    case "projection": {
      const ahead = formatAheadOfTarget(a.projectedEndingNetWorth, a.targetVnd, fmt);
      if (a.tone === "on_track") {
        return `Projected ${fmt.money(a.projectedEndingNetWorth)} at age ${MILESTONE_TARGET_AGE} — ${ahead.pctLabel} (${ahead.moneyLabel}) above the ${fmt.usd(a.targetUsd)} goal (≈ ${fmt.money(a.targetVnd)}).`;
      }
      if (a.tone === "steady") {
        return `Projected ${fmt.money(a.projectedEndingNetWorth)} — ${ahead.pctLabel} (${ahead.moneyLabel}) above target with very little runway left.`;
      }
      const gap = a.targetVnd - a.projectedEndingNetWorth;
      const shortPct = a.targetVnd > 0 ? ((gap / a.targetVnd) * 100).toFixed(1) : "0";
      return `Trajectory lands near ${fmt.money(a.projectedEndingNetWorth)} — about ${fmt.money(gap)} (${shortPct}%) below target.`;
    }
  }
}

/** Short chip detail ("+12.5% · +X ₫") when the milestone is met or projected to be. */
export function milestoneChipDetail(
  a: MilestoneAnalysis,
  currentNetWorth: number,
  fmt: MilestoneFormatters,
): string | undefined {
  if (a.kind === "achieved") return formatAheadOfTarget(currentNetWorth, a.targetVnd, fmt).detail;
  if (a.kind === "projection" && a.feasible) {
    return formatAheadOfTarget(a.projectedEndingNetWorth, a.targetVnd, fmt).detail;
  }
  return undefined;
}
