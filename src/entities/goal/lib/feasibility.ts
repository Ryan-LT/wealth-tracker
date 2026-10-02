export type GoalFeasibilityTone =
  | "achieved"
  | "on_track"
  | "steady"
  | "watch"
  | "tight"
  | "at_risk"
  | "unknown";

/** Verdict codes; the badge label and the longer hint are `t.domain.feasibility[code]`. */
export const FEASIBILITY_CODES = ["set_target", "target_met", "closing_in", "building", "early_stretch", "just_started", "past_deadline", "growth_on_track", "budget_squeeze", "on_track", "feasible", "watch_pace", "tight_runway", "off_pace", "final_sprint", "calendar_heat", "check_timing", "in_range", "steady"] as const;
export type GoalFeasibilityCode = (typeof FEASIBILITY_CODES)[number];

export type GoalFeasibility = {
  tone: GoalFeasibilityTone;
  code: GoalFeasibilityCode;
};

import { isTargetDatePast, monthsUntilTarget } from "@/entities/goal/lib/projection";
import { parseIsoDay } from "@/shared/lib/date";
import { requiredMonthly } from "@/shared/lib/growth";

export type GoalFeasibilityInput = {
  saved: number;
  targetAmount: number;
  /** ISO `yyyy-mm-dd` from goal plan. */
  targetDateIso?: string;
  /** When false, projection ignores household monthly net for this plan. */
  includeMonthlyIncome?: boolean;
  /**
   * This plan's monthly contribution: household net × its share (see
   * `resolveMonthlyShares`). Ignored when `includeMonthlyIncome` is false.
   */
  estimatedMonthlyNet: number;
  /** Expected yearly return in percent on the plan balance; default 0. */
  expectedReturnPct?: number;
  now?: Date;
};

/**
 * Lightweight “pulse check” for dashboard cards: compares progress, optional deadline,
 * and (when enabled) household monthly net vs implied savings pace to the target.
 */
export function computeGoalFeasibility(input: GoalFeasibilityInput): GoalFeasibility {
  const {
    saved,
    targetAmount,
    targetDateIso,
    includeMonthlyIncome = true,
    estimatedMonthlyNet,
    expectedReturnPct = 0,
    now = new Date(),
  } = input;
  const annualReturn = Math.max(0, expectedReturnPct) / 100;

  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    return {
      tone: "unknown",
      code: "set_target",
    };
  }

  const remaining = targetAmount - saved;
  if (remaining <= 0) {
    return {
      tone: "achieved",
      code: "target_met",
    };
  }

  const deadline = parseIsoDay(targetDateIso);
  if (!deadline) {
    const pct = (saved / targetAmount) * 100;
    if (pct >= 85) {
      return {
        tone: "on_track",
        code: "closing_in",
      };
    }
    if (pct >= 45) {
      return {
        tone: "steady",
        code: "building",
      };
    }
    if (pct >= 18) {
      return {
        tone: "watch",
        code: "early_stretch",
      };
    }
    return {
      tone: "steady",
      code: "just_started",
    };
  }

  const monthsLeft = monthsUntilTarget(targetDateIso, now);

  if (isTargetDatePast(targetDateIso, now)) {
    return {
      tone: "at_risk",
      code: "past_deadline",
    };
  }

  const minHorizon = 1 / 12;
  const horizon = Math.max(monthsLeft, minHorizon);
  // Pace needed from savings, after expected growth on what is already allocated.
  const requiredPerMonth = requiredMonthly(saved, targetAmount, horizon, annualReturn);

  if (includeMonthlyIncome) {
    if (requiredPerMonth <= 0) {
      return {
        tone: "on_track",
        code: "growth_on_track",
      };
    }
    if (estimatedMonthlyNet <= 0) {
      return {
        tone: "at_risk",
        code: "budget_squeeze",
      };
    }

    const ratio = estimatedMonthlyNet / requiredPerMonth;
    if (ratio >= 1.12) {
      return {
        tone: "on_track",
        code: "on_track",
      };
    }
    if (ratio >= 0.92) {
      return {
        tone: "steady",
        code: "feasible",
      };
    }
    if (ratio >= 0.72) {
      return {
        tone: "watch",
        code: "watch_pace",
      };
    }
    if (ratio >= 0.45) {
      return {
        tone: "tight",
        code: "tight_runway",
      };
    }
    return {
      tone: "at_risk",
      code: "off_pace",
    };
  }

  const urgency = (100 - (saved / targetAmount) * 100) / Math.max(monthsLeft, minHorizon);
  if (monthsLeft < 0.35 && (saved / targetAmount) * 100 < 92) {
    return {
      tone: "at_risk",
      code: "final_sprint",
    };
  }
  if (urgency > 28) {
    return {
      tone: "tight",
      code: "calendar_heat",
    };
  }
  if (urgency > 14) {
    return {
      tone: "watch",
      code: "check_timing",
    };
  }
  if ((saved / targetAmount) * 100 >= 78) {
    return {
      tone: "on_track",
      code: "in_range",
    };
  }
  return {
    tone: "steady",
    code: "steady",
  };
}
