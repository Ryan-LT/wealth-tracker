import { EMPTY_GOAL_PROFILE, type GoalProfile } from "@/entities/goal";
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
    name: source.name?.trim() || "Income source",
    seedLines: source.capitalLines ?? [],
  };
}

/** Sum of all amounts in a capital line set. */
export function totalCapitalAmount(lines: ReadonlyArray<{ amount: number }> | undefined): number {
  if (!lines) return 0;
  return lines.reduce((s, l) => s + Math.max(0, l.amount), 0);
}
