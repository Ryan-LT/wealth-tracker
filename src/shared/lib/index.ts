export { cn } from "./cn";
export { buildGoalStartingOptions } from "./goal-starting-options";
export type { GoalStartingOption } from "./goal-starting-options";
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
} from "./goal-seed-lines";
export type { SourceGoalUsage } from "./goal-seed-lines";
export { formatVnd, formatThousands } from "./format-vnd";
export { formatUsd } from "./format-usd";
export {
  DEFAULT_MILESTONE_USD,
  evaluateMilestone35Feasibility,
  futureValueWithMonthlyContributions,
  MILESTONE_TARGET_AGE,
  monthsBetween,
  parseIsoDateOnly,
  thirtyFifthBirthday,
} from "./milestone-35-projection";
export type { Milestone35Feasibility } from "./milestone-35-projection";
export { formatDisplayDate } from "./format-date";
export {
  cumulativeDueScheduleFromCheckpoints,
  normalizeStoredCheckpoints,
} from "./goal-checkpoints";
export {
  monthlyIncomeByKind,
  totalAssetValue,
  totalCombinedAssetValue,
  totalDebtBalance,
  totalMonthlyIncomeFromSources,
  totalSettingsAssetsValue,
} from "./wealth-totals";
export {
  buildNetWorthChartSeries,
  estimatedMonthlyNetCashflow,
  fractionalMonthsUntilYearEnd,
  monthCalendarKey,
  monthToDateNetWorthChangePercent,
  projectNetWorthEndOfYear,
  syncNetWorthTracking,
} from "./finance";
export { computeGoalFeasibility } from "./goal-feasibility";
export type { GoalFeasibility, GoalFeasibilityTone, GoalFeasibilityInput } from "./goal-feasibility";
export type { NetWorthMonthSnapshot } from "@/shared/storage/preferences";
