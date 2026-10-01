import { goalProfileForDashboard, type GoalsState } from "@/entities/goal/model";
import { totalGoalStartingBalance } from "@/entities/goal/lib/seed-lines";
import type { GoalStartingOption } from "@/entities/goal/lib/starting-options";

export type GoalPlanSummary = {
  key: string;
  /** Saved plan id; undefined for the legacy primary goal fallback. */
  planId?: string;
  name: string;
  targetAmount: number;
  saved: number;
  savedCaption: "Allocated starting" | "Saved";
  targetDate: string;
  includeMonthlyIncome: boolean;
};

/**
 * One summary per saved plan for the dashboard. With no saved plans, falls back to
 * the legacy `goals.primary` document.
 */
export function buildGoalPlanSummaries(
  goals: GoalsState,
  seedOptions: GoalStartingOption[],
  netWorth: number,
): GoalPlanSummary[] {
  if (goals.profiles.length > 0) {
    return goals.profiles.map((plan) => ({
      key: plan.id,
      planId: plan.id,
      name: plan.name.trim() || "Untitled plan",
      targetAmount: plan.targetAmount,
      saved: totalGoalStartingBalance(plan.seedLines, seedOptions, goals.profiles, plan),
      savedCaption: "Allocated starting",
      targetDate: plan.targetDate,
      includeMonthlyIncome: plan.includeMonthlyIncome !== false,
    }));
  }

  const primaryProfile = goalProfileForDashboard(goals);
  const target = primaryProfile?.targetAmount ?? goals.primary.targetAmount;
  const name =
    primaryProfile?.name?.trim() || goals.primary.name?.trim() || "Primary Goal";
  const saved =
    goals.primary.saved > 0
      ? Math.min(goals.primary.saved, target)
      : Math.min(Math.max(0, netWorth), target);

  return [
    {
      key: "legacy-primary",
      name,
      targetAmount: target,
      saved,
      savedCaption: "Saved",
      targetDate: primaryProfile?.targetDate ?? "",
      includeMonthlyIncome: primaryProfile?.includeMonthlyIncome !== false,
    },
  ];
}

/** Rounded progress percent (unclamped; callers clamp progress bars). */
export function goalProgressPercent(saved: number, targetAmount: number): number {
  return targetAmount === 0 ? 0 : Math.round((saved / targetAmount) * 100);
}
