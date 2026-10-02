import { activeMessages } from "@/shared/i18n/active";
import {
  EMPTY_GOAL_PROFILE,
  GOAL_PLAN_NEW_SENTINEL,
  type GoalProfile,
  type GoalsState,
} from "@/entities/goal/model";
import { normalizeStoredCheckpoints } from "@/entities/goal/lib/checkpoints";
import {
  clampSeedLinesToAllocationPool,
  ensureKeyedSeedDefaults,
  migrateLegacySeedsToLines,
  sanitizeSeedLinesAgainstOptions,
} from "@/entities/goal/lib/seed-lines";
import type { GoalStartingOption } from "@/entities/goal/lib/starting-options";

/** Profile the Goal Plan editor should show for the current `activeProfileId`. */
export function resolvePlanEditorProfile(goals: GoalsState): GoalProfile {
  if (goals.activeProfileId === GOAL_PLAN_NEW_SENTINEL) {
    return EMPTY_GOAL_PROFILE;
  }
  return (
    goals.profiles.find((p) => p.id === goals.activeProfileId) ??
    goals.profiles[0] ??
    EMPTY_GOAL_PROFILE
  );
}

/** Migrate legacy seeds, drop dead sources, default keyed amounts, normalize checkpoints. */
export function normalizeGoalProfile(
  p: GoalProfile,
  seedKeys: Set<string>,
  seedOptions: GoalStartingOption[],
  savedPlans: GoalProfile[],
): GoalProfile {
  const raw = migrateLegacySeedsToLines(p);
  let lines = sanitizeSeedLinesAgainstOptions(raw, seedKeys);
  lines = ensureKeyedSeedDefaults(lines, seedOptions, savedPlans, {
    ...p,
    seedLines: lines,
  });
  return {
    ...p,
    seedLines: lines,
    checkpoints: normalizeStoredCheckpoints(p.checkpoints),
    monthlyContribution:
      typeof p.monthlyContribution === "number" ? p.monthlyContribution : 0,
    includeMonthlyIncome: p.includeMonthlyIncome !== false,
  };
}

/** `undefined` (automatic / none) or a percent clamped to 0–max. */
function normalizePct(v: number | undefined, max: number): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(0, v)) : undefined;
}

export type UpsertGoalPlanContext = {
  seedKeys: Set<string>;
  seedOptions: GoalStartingOption[];
  /** Total monthly income from income sources (stored as legacy `monthlyContribution`). */
  incomeMonthly: number;
  newId?: () => string;
};

/**
 * Save a draft into `goals.profiles` (insert or replace) and make it active.
 * Starting-balance lines are sanitized and clamped to the shared allocation pool.
 */
export function upsertGoalPlan(
  prev: GoalsState,
  source: GoalProfile,
  ctx: UpsertGoalPlanContext,
): GoalsState {
  const cleanLines = sanitizeSeedLinesAgainstOptions(source.seedLines ?? [], ctx.seedKeys);
  const existingById =
    source.id !== "" ? prev.profiles.find((p) => p.id === source.id) : undefined;
  const id = existingById ? source.id : (ctx.newId ?? (() => `goal-${Date.now()}`))();

  const savedBase: GoalProfile = {
    ...(existingById ?? {}),
    id,
    name: source.name.trim() || activeMessages().domain.fallbacks.untitledPlan,
    targetAmount: source.targetAmount,
    targetDate: source.targetDate,
    monthlyContribution: ctx.incomeMonthly,
    includeMonthlyIncome: source.includeMonthlyIncome !== false,
    monthlySharePct: normalizePct(source.monthlySharePct, 100),
    expectedReturnPct: normalizePct(source.expectedReturnPct, 30),
    seedLines: cleanLines,
    checkpoints: normalizeStoredCheckpoints(source.checkpoints),
  };

  const clampedLines = clampSeedLinesToAllocationPool(
    cleanLines,
    ctx.seedOptions,
    prev.profiles,
    savedBase,
  );
  const saved: GoalProfile = { ...savedBase, seedLines: clampedLines };

  const hasId = prev.profiles.some((p) => p.id === id);
  const profiles = hasId
    ? prev.profiles.map((p) => (p.id === id ? saved : p))
    : [...prev.profiles, saved];

  return { ...prev, profiles, activeProfileId: id };
}

/** Delete a plan; if it was active, fall back to the first plan or a new draft. */
export function removeGoalPlan(prev: GoalsState, id: string): GoalsState {
  const nextProfiles = prev.profiles.filter((p) => p.id !== id);
  let nextActive = prev.activeProfileId;
  if (nextActive === id) {
    nextActive = nextProfiles[0]?.id ?? GOAL_PLAN_NEW_SENTINEL;
  } else if (
    nextActive &&
    nextActive !== GOAL_PLAN_NEW_SENTINEL &&
    !nextProfiles.some((p) => p.id === nextActive)
  ) {
    nextActive = nextProfiles[0]?.id ?? GOAL_PLAN_NEW_SENTINEL;
  }
  return { ...prev, profiles: nextProfiles, activeProfileId: nextActive };
}

export type PlanSection = "basics" | "income";

/** Restore one editable section of the draft from the last saved profile. */
export function revertPlanSection(
  draft: GoalProfile,
  saved: GoalProfile,
  section: PlanSection,
): GoalProfile {
  if (section === "basics") {
    return {
      ...draft,
      name: saved.name,
      targetAmount: saved.targetAmount,
      targetDate: saved.targetDate,
    };
  }
  return {
    ...draft,
    includeMonthlyIncome: saved.includeMonthlyIncome,
    monthlySharePct: saved.monthlySharePct,
    expectedReturnPct: saved.expectedReturnPct,
  };
}
