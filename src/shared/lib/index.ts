// Entity-agnostic helpers stay here.
export { cn, getDisplayNameInitials } from "./cn";
export { useIsMobile } from "./use-mobile";
export { formatVnd, formatThousands } from "./format-vnd";
export { formatUsd } from "./format-usd";
export { formatDisplayDate } from "./format-date";
export {
  DEFAULT_MILESTONE_USD,
  evaluateMilestone35Feasibility,
  futureValueWithMonthlyContributions,
  MILESTONE_TARGET_AGE,
  monthsBetween,
  parseIsoDateOnly,
  thirtyFifthBirthday,
  type Milestone35Feasibility,
} from "./milestone-35-projection";

// Migration shims: re-exported from entity slices for backward compatibility.
// New code should import directly from @/entities/<name>.
export { totalAssetValue } from "@/entities/asset";
export { totalDebtBalance } from "@/entities/debt";
export { monthlyIncomeByKind, totalMonthlyIncomeFromSources } from "@/entities/income";
export { totalSettingsAssetsValue } from "@/entities/settings-asset";
export {
  buildNetWorthChartSeries,
  estimatedMonthlyNetCashflow,
  fractionalMonthsUntilYearEnd,
  monthCalendarKey,
  monthToDateNetWorthChangePercent,
  projectNetWorthEndOfYear,
  syncNetWorthTracking,
  type NetWorthMonthSnapshot,
} from "@/entities/preferences";
export {
  appendGoalSeedLine,
  buildGoalStartingOptions,
  clampSeedLinesToAllocationPool,
  computeGoalFeasibility,
  cumulativeDueScheduleFromCheckpoints,
  dedupeNonCustomSeedLines,
  effectiveGoalSeedLineAmount,
  ensureKeyedSeedDefaults,
  goalUsageForSourceKey,
  labelForSeedLine,
  liveBalanceForSourceKey,
  maxAllocationForSourceKey,
  migrateLegacySeedsToLines,
  normalizeStoredCheckpoints,
  resolvedSeedLineAmount,
  sanitizeSeedLinesAgainstOptions,
  totalGoalStartingBalance,
  type GoalFeasibility,
  type GoalFeasibilityInput,
  type GoalFeasibilityTone,
  type GoalStartingOption,
  type SourceGoalUsage,
} from "@/entities/goal";
