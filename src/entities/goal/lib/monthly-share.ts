import type { GoalProfile } from "@/entities/goal/model";

export type MonthlyShares = {
  /** Plan id → fraction (0–1) of the household monthly net it receives. */
  byPlan: Map<string, number>;
  /** Explicit shares add up to more than 100 % (they are scaled down to fit). */
  overAllocated: boolean;
  /** Fraction of monthly net no plan receives (only when every plan has an explicit share). */
  unassigned: number;
};

function explicitShare(p: GoalProfile): number | null {
  const v = p.monthlySharePct;
  return typeof v === "number" && Number.isFinite(v) ? Math.min(100, Math.max(0, v)) / 100 : null;
}

/**
 * Split the household monthly net between plans so it is never counted twice.
 * Only plans that include monthly income take part. Plans with an explicit
 * share get it; the rest split what's left evenly. Explicit shares over 100 %
 * are scaled down proportionally (and automatic plans get nothing).
 */
export function resolveMonthlyShares(profiles: GoalProfile[]): MonthlyShares {
  const byPlan = new Map<string, number>();
  const participants = profiles.filter((p) => p.includeMonthlyIncome !== false);
  for (const p of profiles) if (p.includeMonthlyIncome === false) byPlan.set(p.id, 0);

  const explicit = participants.filter((p) => explicitShare(p) !== null);
  const automatic = participants.filter((p) => explicitShare(p) === null);
  const explicitTotal = explicit.reduce((s, p) => s + explicitShare(p)!, 0);

  const overAllocated = explicitTotal > 1 + 1e-9;
  const scale = overAllocated ? 1 / explicitTotal : 1;
  for (const p of explicit) byPlan.set(p.id, explicitShare(p)! * scale);

  const left = Math.max(0, 1 - explicitTotal * scale);
  for (const p of automatic) byPlan.set(p.id, left / automatic.length);

  return { byPlan, overAllocated, unassigned: automatic.length === 0 ? left : 0 };
}

/** The plans as they would be with `draft` saved (replacing its saved version, or added). */
export function profilesWithDraft(profiles: GoalProfile[], draft: GoalProfile): GoalProfile[] {
  const key = draft.id || "__draft__";
  const withKey = { ...draft, id: key };
  return profiles.some((p) => p.id === key) ? profiles.map((p) => (p.id === key ? withKey : p)) : [...profiles, withKey];
}

/** Fraction of the monthly net `draft` receives, given the other saved plans. */
export function monthlyShareForDraft(profiles: GoalProfile[], draft: GoalProfile): number {
  const all = profilesWithDraft(profiles, draft);
  return resolveMonthlyShares(all).byPlan.get(draft.id || "__draft__") ?? 0;
}
