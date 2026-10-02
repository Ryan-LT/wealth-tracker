import { activeMessages } from "@/shared/i18n/active";
import {
  EMPTY_GOAL_PROFILE,
  totalGoalStartingBalance,
  type GoalProfile,
  type GoalStartingOption,
} from "@/entities/goal";
import type { IncomeSource } from "@/entities/income/model";

/**
 * Wrap an IncomeSource as a `GoalProfile`-shaped object so it can be passed to
 * helpers that operate on goal profiles (StartingBalancesModal, capacity calcs,
 * allocation reports). The synthetic id is `income:<source.id>` so wrapped
 * income sources never collide with real goal-plan ids.
 *
 * Reservations on the wrapped object stay isolated from real goal plans — call
 * sites decide whether to mix them or keep them in separate pools.
 */
export function wrapIncomeSourceAsProfile(source: IncomeSource): GoalProfile {
  return {
    ...EMPTY_GOAL_PROFILE,
    id: `income:${source.id}`,
    name: source.name?.trim() || activeMessages().domain.fallbacks.incomeSource,
    seedLines: source.capitalLines ?? [],
  };
}

/** Sum of all amounts in a capital line set. */
export function totalCapitalAmount(lines: ReadonlyArray<{ amount: number }> | undefined): number {
  if (!lines) return 0;
  return lines.reduce((s, l) => s + Math.max(0, l.amount), 0);
}

/**
 * Capital that actually backs `source`: its reservations, scaled down the same
 * way goal allocations are when a source asset is worth less than what all
 * income sources reserved from it.
 */
export function effectiveIncomeCapital(
  source: IncomeSource,
  allSources: IncomeSource[],
  options: GoalStartingOption[],
): number {
  const wrapped = wrapIncomeSourceAsProfile(source);
  const peers = allSources.map(wrapIncomeSourceAsProfile);
  return totalGoalStartingBalance(wrapped.seedLines, options, peers, wrapped);
}

/** Yearly yield (%) of an income source on its capital; `null` without capital. */
export function capitalYieldPct(monthly: number, capital: number): number | null {
  return capital > 0 ? ((Math.max(0, monthly) * 12) / capital) * 100 : null;
}
