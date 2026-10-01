export type {
  FxSource,
  MilestoneConfigOk,
  MilestoneConfigPartial,
  MilestoneConfigResponse,
} from "@/entities/milestone/model";
export {
  analyzeMilestone35,
  formatAheadOfTarget,
  milestoneChipDetail,
  milestoneHint,
  type MilestoneAnalysis,
  type MilestoneFormatters,
} from "@/entities/milestone/lib/analyze";
export {
  DEFAULT_MILESTONE_USD,
  MILESTONE_TARGET_AGE,
} from "@/shared/lib/milestone-35-projection";
