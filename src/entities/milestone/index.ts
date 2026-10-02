export type {
  FxSource,
  MilestoneConfigResponse,
  MilestoneSettings,
  ResolvedMilestoneSettings,
} from "@/entities/milestone/model";
export {
  analyzeMilestone,
  formatAheadOfTarget,
  milestoneChipDetail,
  milestoneHint,
  resolveMilestoneSettings,
  type MilestoneAnalysis,
  type MilestoneFormatters,
} from "@/entities/milestone/lib/analyze";
export {
  DEFAULT_MILESTONE_AGE,
  DEFAULT_MILESTONE_USD,
  MAX_MILESTONE_AGE,
  MIN_MILESTONE_AGE,
} from "@/shared/lib/milestone-projection";
