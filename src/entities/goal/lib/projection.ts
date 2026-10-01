import { AVG_MONTH_MS } from "@/shared/lib/date";

/**
 * Whole months from `now` until the goal date (rounded, minimum 1).
 * Parses with `new Date(iso)` (UTC midnight for date-only strings) to match
 * the original Goal Plan behaviour.
 */
export function monthsToTargetRounded(
  targetDateIso: string | undefined,
  now: Date = new Date(),
): number {
  if (!targetDateIso) return 1;
  const target = new Date(targetDateIso);
  if (Number.isNaN(target.getTime())) return 1;
  const ms = Math.max(0, target.getTime() - now.getTime());
  return Math.max(1, Math.round(ms / AVG_MONTH_MS));
}

export type GoalProjectionNote =
  | { kind: "incomplete" }
  | { kind: "no_income" }
  | { kind: "non_positive_net" }
  | { kind: "income_off_short"; flatAt: number; gap: number }
  | { kind: "ahead"; surplus: number }
  | { kind: "on_target" }
  | { kind: "short"; gap: number };

export type GoalProjectionStatus = "unset" | "feasible" | "shortfall";

export type GoalProjectionSummary = {
  monthsToTarget: number;
  applyMonthlyIncome: boolean;
  /** Household monthly net when the plan includes income, otherwise 0. */
  effectiveMonthlyContribution: number;
  projectedAtTarget: number;
  status: GoalProjectionStatus;
  /** Income exists but average spending cancels it out exactly. */
  incomeOffsetBySpending: boolean;
  note: GoalProjectionNote;
};

export type GoalProjectionInput = {
  startingBalance: number;
  targetAmount: number;
  targetDateIso: string;
  includeMonthlyIncome?: boolean;
  /** Total monthly income from income sources. */
  incomeMonthly: number;
  /** From `estimatedMonthlyNetCashflow`. */
  householdMonthlyNet: number;
  now?: Date;
};

/** Linear projection used by the Goal Plan page (starting balance + net × months). */
export function computeGoalProjection(input: GoalProjectionInput): GoalProjectionSummary {
  const {
    startingBalance,
    targetAmount,
    targetDateIso,
    incomeMonthly,
    householdMonthlyNet,
    now,
  } = input;
  const monthsToTarget = monthsToTargetRounded(targetDateIso, now);
  const applyMonthlyIncome = input.includeMonthlyIncome !== false;
  const effectiveMonthlyContribution = applyMonthlyIncome ? householdMonthlyNet : 0;
  const projectedAtTarget = startingBalance + effectiveMonthlyContribution * monthsToTarget;

  const onTrack =
    targetAmount > 0 && projectedAtTarget >= targetAmount && monthsToTarget >= 1;
  const status: GoalProjectionStatus =
    targetAmount <= 0 ? "unset" : onTrack ? "feasible" : "shortfall";

  let note: GoalProjectionNote;
  if (targetAmount <= 0 || !targetDateIso) {
    note = { kind: "incomplete" };
  } else if (applyMonthlyIncome && incomeMonthly <= 0 && projectedAtTarget < targetAmount) {
    note = { kind: "no_income" };
  } else if (
    applyMonthlyIncome &&
    incomeMonthly > 0 &&
    effectiveMonthlyContribution <= 0 &&
    projectedAtTarget < targetAmount
  ) {
    note = { kind: "non_positive_net" };
  } else if (!applyMonthlyIncome && projectedAtTarget < targetAmount) {
    note = {
      kind: "income_off_short",
      flatAt: startingBalance,
      gap: targetAmount - projectedAtTarget,
    };
  } else if (projectedAtTarget >= targetAmount) {
    const surplus = projectedAtTarget - targetAmount;
    note = surplus > 0 ? { kind: "ahead", surplus } : { kind: "on_target" };
  } else {
    note = { kind: "short", gap: targetAmount - projectedAtTarget };
  }

  return {
    monthsToTarget,
    applyMonthlyIncome,
    effectiveMonthlyContribution,
    projectedAtTarget,
    status,
    incomeOffsetBySpending: incomeMonthly > 0 && effectiveMonthlyContribution === 0,
    note,
  };
}

export function describeGoalProjectionNote(
  note: GoalProjectionNote,
  fmt: (amount: number) => string,
): string {
  switch (note.kind) {
    case "incomplete":
      return "Add target, date, and starting sources.";
    case "no_income":
      return "No monthly income recorded — only starting allocations count.";
    case "non_positive_net":
      return "Monthly net is zero or negative after spending — increase income or lower average spending.";
    case "income_off_short":
      return `Income off for this plan — flat at ${fmt(note.flatAt)}; short ~${fmt(note.gap)}.`;
    case "ahead":
      return `Ahead by ~${fmt(note.surplus)}.`;
    case "on_target":
      return "On target.";
    case "short":
      return `Short ~${fmt(note.gap)} vs target.`;
  }
}

/** Tone of the projection note for callouts. */
export function goalProjectionNoteTone(
  note: GoalProjectionNote,
): "info" | "success" | "warning" | "danger" {
  switch (note.kind) {
    case "incomplete":
      return "info";
    case "ahead":
    case "on_target":
      return "success";
    case "no_income":
    case "non_positive_net":
      return "warning";
    default:
      return "danger";
  }
}

export type StartingOnlyStatus =
  | { kind: "no_target" }
  | { kind: "met"; surplus: number }
  | { kind: "short"; gap: number };

/** Plans that exclude income compare only the allocated starting balance to the target. */
export function evaluateStartingOnlyStatus(
  startingBalance: number,
  targetAmount: number,
): StartingOnlyStatus {
  if (targetAmount <= 0) return { kind: "no_target" };
  if (startingBalance >= targetAmount) {
    return { kind: "met", surplus: Math.max(0, startingBalance - targetAmount) };
  }
  return { kind: "short", gap: Math.max(0, targetAmount - startingBalance) };
}
