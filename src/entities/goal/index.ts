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
} from "@/entities/goal/model";
export {
  buildGoalStartingOptions,
  type GoalStartingOption,
} from "@/entities/goal/lib/starting-options";
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
} from "@/entities/goal/lib/seed-lines";
export {
  computeGoalFeasibility,
  type GoalFeasibility,
  type GoalFeasibilityInput,
  type GoalFeasibilityTone,
} from "@/entities/goal/lib/feasibility";
export {
  cumulativeDueScheduleFromCheckpoints,
  normalizeStoredCheckpoints,
} from "@/entities/goal/lib/checkpoints";
