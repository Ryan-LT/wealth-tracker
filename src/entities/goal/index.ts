export {
  EMPTY_GOAL_PROFILE,
  GOALS_SEED,
  GOAL_PLAN_NEW_SENTINEL,
  GOAL_SIMULATOR_NEW_SENTINEL,
  goalProfileForDashboard,
  type GoalCheckpoint,
  type GoalProfile,
  type GoalSeedLine,
  type GoalsState,
} from "./model";
export { buildGoalStartingOptions } from "./lib/starting-options";
export type { GoalStartingOption } from "./lib/starting-options";
export {
  appendGoalSeedLine,
  clampSeedLinesToAllocationPool,
  dedupeNonCustomSeedLines,
  effectiveGoalSeedLineAmount,
  ensureKeyedSeedDefaults,
  goalUsageForSourceKey,
  labelForSeedLine,
  liveBalanceForSourceKey,
  maxAllocationForSourceKey,
  migrateLegacySeedsToLines,
  resolvedSeedLineAmount,
  sanitizeSeedLinesAgainstOptions,
  totalGoalStartingBalance,
  type SourceGoalUsage,
} from "./lib/seed-lines";
export {
  computeGoalFeasibility,
  type GoalFeasibility,
  type GoalFeasibilityInput,
  type GoalFeasibilityTone,
} from "./lib/feasibility";
export {
  cumulativeDueScheduleFromCheckpoints,
  normalizeStoredCheckpoints,
} from "./lib/checkpoints";
