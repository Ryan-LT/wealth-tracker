export type GoalFeasibilityTone =
  | "achieved"
  | "on_track"
  | "steady"
  | "watch"
  | "tight"
  | "at_risk"
  | "unknown";

export type GoalFeasibility = {
  tone: GoalFeasibilityTone;
  /** Short badge label. */
  label: string;
  /** Longer context for `title` / tooltips. */
  hint: string;
};

const MS_PER_MONTH = (1000 * 60 * 60 * 24 * 365.25) / 12;

function parseTargetDate(iso: string | undefined): Date | null {
  if (!iso?.trim()) return null;
  const raw = iso.trim();
  const d = new Date(raw.includes("T") ? raw : `${raw}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function monthsBetween(from: Date, to: Date): number {
  return Math.max(0, (to.getTime() - from.getTime()) / MS_PER_MONTH);
}

export type GoalFeasibilityInput = {
  saved: number;
  targetAmount: number;
  /** ISO `yyyy-mm-dd` from goal plan. */
  targetDateIso?: string;
  /** When false, projection ignores household monthly net for this plan. */
  includeMonthlyIncome?: boolean;
  /** From {@link estimatedMonthlyNetCashflow}; ignored when `includeMonthlyIncome` is false. */
  estimatedMonthlyNet: number;
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
    now = new Date(),
  } = input;

  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    return {
      tone: "unknown",
      label: "Set a target",
      hint: "Add a target amount to gauge feasibility.",
    };
  }

  const remaining = targetAmount - saved;
  if (remaining <= 0) {
    return {
      tone: "achieved",
      label: "Target met",
      hint: "Allocated or saved amount meets or exceeds this goal.",
    };
  }

  const deadline = parseTargetDate(targetDateIso);
  if (!deadline) {
    const pct = (saved / targetAmount) * 100;
    if (pct >= 85) {
      return {
        tone: "on_track",
        label: "Closing in",
        hint: "Strong progress. Add a target date for a runway check.",
      };
    }
    if (pct >= 45) {
      return {
        tone: "steady",
        label: "Building",
        hint: "Momentum looks fine. A deadline unlocks a sharper signal.",
      };
    }
    if (pct >= 18) {
      return {
        tone: "watch",
        label: "Early stretch",
        hint: "Still early — set a target date to see if pace matches the calendar.",
      };
    }
    return {
      tone: "steady",
      label: "Just started",
      hint: "Low progress is normal at the start. Add a target date when you can.",
    };
  }

  const monthsLeft = monthsBetween(now, deadline);

  if (deadline.getTime() < now.getTime()) {
    return {
      tone: "at_risk",
      label: "Past deadline",
      hint: "This target date has passed and the goal is not fully funded yet.",
    };
  }

  const minHorizon = 1 / 12;
  const horizon = Math.max(monthsLeft, minHorizon);
  const requiredPerMonth = remaining / horizon;

  if (includeMonthlyIncome) {
    if (estimatedMonthlyNet <= 0) {
      return {
        tone: "at_risk",
        label: "Budget squeeze",
        hint: "Household monthly net is not positive while this goal still has a gap.",
      };
    }

    const ratio = estimatedMonthlyNet / requiredPerMonth;
    if (ratio >= 1.12) {
      return {
        tone: "on_track",
        label: "On track",
        hint: "Estimated monthly net comfortably covers the pace needed to hit the date.",
      };
    }
    if (ratio >= 0.92) {
      return {
        tone: "steady",
        label: "Feasible",
        hint: "Monthly net is roughly aligned with the pace implied by your target date.",
      };
    }
    if (ratio >= 0.72) {
      return {
        tone: "watch",
        label: "Watch pace",
        hint: "You are close — small drags on cash flow could push the finish past the date.",
      };
    }
    if (ratio >= 0.45) {
      return {
        tone: "tight",
        label: "Tight runway",
        hint: "Implied monthly pace is meaningfully above what net cash flow suggests today.",
      };
    }
    return {
      tone: "at_risk",
      label: "Off pace",
      hint: "At current net cash flow, this date and gap look hard to reconcile without changes.",
    };
  }

  const urgency = (100 - (saved / targetAmount) * 100) / Math.max(monthsLeft, minHorizon);
  if (monthsLeft < 0.35 && (saved / targetAmount) * 100 < 92) {
    return {
      tone: "at_risk",
      label: "Final sprint",
      hint: "Very little calendar runway left versus what is still left to fund.",
    };
  }
  if (urgency > 28) {
    return {
      tone: "tight",
      label: "Calendar heat",
      hint: "Without counting monthly income toward this plan, the deadline still feels aggressive.",
    };
  }
  if (urgency > 14) {
    return {
      tone: "watch",
      label: "Check timing",
      hint: "Progress is okay, but the date is getting closer — revisit allocations.",
    };
  }
  if ((saved / targetAmount) * 100 >= 78) {
    return {
      tone: "on_track",
      label: "In range",
      hint: "Progress and time left look compatible for an allocations-only path.",
    };
  }
  return {
    tone: "steady",
    label: "Steady",
    hint: "No income glidepath is applied for this plan; signal is from progress vs time.",
  };
}
