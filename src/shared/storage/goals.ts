export type GoalSeedLine = {
  id: string;
  /** `custom` or a key from {@link buildGoalStartingOptions} (e.g. `re:id`, `catalog:id`). */
  sourceKey: string;
  /**
   * `custom`: entered ₫. Keyed rows: ₫ **allocated** from that source to this plan
   * (capped by live balance minus amounts reserved on your other plans).
   */
  amount: number;
};

export type GoalProfile = {
  id: string;
  name: string;
  targetAmount: number;
  /** ISO date (yyyy-mm-dd). */
  targetDate: string;
  /**
   * Legacy field; kept for older saves. Live projection uses current income sources
   * from Asset configuration, not this value.
   */
  monthlyContribution: number;
  /** One or more balances that seed the projection (summed). */
  seedLines?: GoalSeedLine[];
  /**
   * @deprecated Migrated into `seedLines`. Read only for older localStorage.
   */
  seedSourceKey?: string;
  /** @deprecated Migrated into `seedLines`. */
  seedAmount?: number;
  active?: boolean;
  /**
   * When true (default), linear projection adds Asset configuration monthly income each month.
   * When false, projection uses only allocated starting balances for this plan.
   */
  includeMonthlyIncome?: boolean;
};

/** Goal Plan: compose a new plan before first save (not a persisted plan id). */
export const GOAL_PLAN_NEW_SENTINEL = "__new__";

/** @deprecated Use {@link GOAL_PLAN_NEW_SENTINEL}. */
export const GOAL_SIMULATOR_NEW_SENTINEL = GOAL_PLAN_NEW_SENTINEL;

export type GoalsState = {
  /** The single primary goal shown on the Dashboard. */
  primary: {
    name: string;
    targetAmount: number;
    saved: number;
  };
  /** Named goal plans on the Goal Plan page (allocations + targets). */
  profiles: GoalProfile[];
  /**
   * Goal Plan editor selection: a saved plan id, empty string, or
   * {@link GOAL_PLAN_NEW_SENTINEL} for a blank draft.
   */
  activeProfileId: string;
};

/** Dashboard: pick a concrete saved plan; ignores {@link GOAL_PLAN_NEW_SENTINEL}. */
export function goalProfileForDashboard(goals: GoalsState): GoalProfile | undefined {
  const { activeProfileId, profiles } = goals;
  if (profiles.length === 0) return undefined;
  if (!activeProfileId || activeProfileId === GOAL_PLAN_NEW_SENTINEL) {
    return profiles[0];
  }
  return profiles.find((p) => p.id === activeProfileId) ?? profiles[0];
}

/** Draft-shaped defaults when there are no saved profiles yet. */
export const EMPTY_GOAL_PROFILE: GoalProfile = {
  id: "",
  name: "",
  targetAmount: 0,
  targetDate: "",
  monthlyContribution: 0,
  seedLines: [],
  includeMonthlyIncome: true,
};

export const GOALS_SEED: GoalsState = {
  primary: {
    name: "",
    targetAmount: 0,
    saved: 0,
  },
  profiles: [],
  activeProfileId: "",
};
