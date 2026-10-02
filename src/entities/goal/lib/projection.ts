import { activeMessages } from "@/shared/i18n/active";
import type { Messages } from "@/shared/i18n/messages/en";
import { fractionalMonthsBetween, parseIsoDay } from "@/shared/lib/date";
import { futureValue } from "@/shared/lib/growth";

/**
 * Months from `now` until the goal date (fractional, same average month as the
 * chart). The date is read at local noon so it never shifts a day. 0 when the
 * date has passed or is missing.
 */
export function monthsUntilTarget(targetDateIso: string | undefined, now: Date = new Date()): number {
  const target = parseIsoDay(targetDateIso);
  return target ? fractionalMonthsBetween(now, target) : 0;
}

/** True when the goal date is before today. */
export function isTargetDatePast(targetDateIso: string | undefined, now: Date = new Date()): boolean {
  const target = parseIsoDay(targetDateIso);
  if (!target) return false;
  const endOfTargetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59, 59, 999);
  return endOfTargetDay.getTime() < now.getTime();
}

export type GoalProjectionNote =
  | { kind: "incomplete" }
  | { kind: "past_due"; gap: number }
  | { kind: "no_income" }
  | { kind: "non_positive_net" }
  | { kind: "no_share" }
  | { kind: "income_off_short"; flatAt: number; gap: number }
  | { kind: "ahead"; surplus: number }
  | { kind: "on_target" }
  | { kind: "short"; gap: number };

export type GoalProjectionStatus = "unset" | "feasible" | "shortfall";

export type GoalProjectionSummary = {
  /** Fractional months until the target date (0 if passed / unset). */
  monthsToTarget: number;
  pastDue: boolean;
  applyMonthlyIncome: boolean;
  /** Fraction (0–1) of the household monthly net this plan receives. */
  monthlyShare: number;
  /** This plan's monthly contribution: household net × share, or 0 when income is excluded. */
  effectiveMonthlyContribution: number;
  /** Yearly return (fraction) applied to the balance. */
  annualReturn: number;
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
  /** Fraction of the monthly net for this plan (see `resolveMonthlyShares`); default 1. */
  monthlyShare?: number;
  /** Expected yearly return in percent (e.g. 5); default 0. */
  expectedReturnPct?: number;
  now?: Date;
};

/** Goal Plan projection: starting balance + this plan's share of monthly net, with optional growth. */
export function computeGoalProjection(input: GoalProjectionInput): GoalProjectionSummary {
  const { startingBalance, targetAmount, targetDateIso, incomeMonthly, householdMonthlyNet, now } = input;
  const monthsToTarget = monthsUntilTarget(targetDateIso, now);
  const pastDue = isTargetDatePast(targetDateIso, now);
  const applyMonthlyIncome = input.includeMonthlyIncome !== false;
  const monthlyShare = applyMonthlyIncome ? Math.min(1, Math.max(0, input.monthlyShare ?? 1)) : 0;
  const effectiveMonthlyContribution = applyMonthlyIncome ? householdMonthlyNet * monthlyShare : 0;
  const annualReturn = Math.max(0, input.expectedReturnPct ?? 0) / 100;
  // A passed date gets no more contributions or growth: what's there now is the result.
  const projectedAtTarget = pastDue
    ? startingBalance
    : futureValue(startingBalance, effectiveMonthlyContribution, monthsToTarget, annualReturn);

  const met = targetAmount > 0 && projectedAtTarget >= targetAmount;
  const status: GoalProjectionStatus = targetAmount <= 0 ? "unset" : met ? "feasible" : "shortfall";

  let note: GoalProjectionNote;
  if (targetAmount <= 0 || !targetDateIso) {
    note = { kind: "incomplete" };
  } else if (pastDue && !met) {
    note = { kind: "past_due", gap: targetAmount - projectedAtTarget };
  } else if (met) {
    const surplus = projectedAtTarget - targetAmount;
    note = surplus > 0 ? { kind: "ahead", surplus } : { kind: "on_target" };
  } else if (!applyMonthlyIncome) {
    note = { kind: "income_off_short", flatAt: projectedAtTarget, gap: targetAmount - projectedAtTarget };
  } else if (incomeMonthly <= 0) {
    note = { kind: "no_income" };
  } else if (householdMonthlyNet <= 0) {
    note = { kind: "non_positive_net" };
  } else if (monthlyShare <= 0) {
    note = { kind: "no_share" };
  } else {
    note = { kind: "short", gap: targetAmount - projectedAtTarget };
  }

  return {
    monthsToTarget,
    pastDue,
    applyMonthlyIncome,
    monthlyShare,
    effectiveMonthlyContribution,
    annualReturn,
    projectedAtTarget,
    status,
    incomeOffsetBySpending: incomeMonthly > 0 && householdMonthlyNet === 0,
    note,
  };
}

/** The projection note in the page's language (`t.domain.projectionNote`). */
export function describeGoalProjectionNote(
  note: GoalProjectionNote,
  fmt: (amount: number) => string,
  m: Messages["domain"]["projectionNote"] = activeMessages().domain.projectionNote,
): string {
  switch (note.kind) {
    case "incomplete":
      return m.incomplete;
    case "past_due":
      return m.pastDue({ gap: fmt(note.gap) });
    case "no_share":
      return m.noShare;
    case "no_income":
      return m.noIncome;
    case "non_positive_net":
      return m.nonPositiveNet;
    case "income_off_short":
      return m.incomeOffShort({ flatAt: fmt(note.flatAt), gap: fmt(note.gap) });
    case "ahead":
      return m.ahead({ surplus: fmt(note.surplus) });
    case "on_target":
      return m.onTarget;
    case "short":
      return m.short({ gap: fmt(note.gap) });
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
    case "no_share":
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
