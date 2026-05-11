export type GoalSeedLine = {
  id: string;
  /** `custom` or a key from {@link buildGoalStartingOptions} (e.g. `re:id`, `catalog:id`). */
  sourceKey: string;
  /**
   * For `custom`, the entered amount. For keyed rows, a fallback if the asset row
   * disappears; live balances are preferred when the key still exists.
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
};

/** Goal Simulator: compose a new profile before first save (not a persisted profile id). */
export const GOAL_SIMULATOR_NEW_SENTINEL = "__new__";

export type GoalsState = {
  /** The single primary goal shown on the Dashboard. */
  primary: {
    name: string;
    targetAmount: number;
    saved: number;
  };
  /** Multi-goal "Saved Profiles" — used by the Goal Simulator page. */
  profiles: GoalProfile[];
  /**
   * Goal Simulator selection: a saved profile id, empty string, or
   * {@link GOAL_SIMULATOR_NEW_SENTINEL} for a blank draft.
   */
  activeProfileId: string;
};

/** Dashboard: pick a concrete saved profile; ignores {@link GOAL_SIMULATOR_NEW_SENTINEL}. */
export function goalProfileForDashboard(goals: GoalsState): GoalProfile | undefined {
  const { activeProfileId, profiles } = goals;
  if (profiles.length === 0) return undefined;
  if (!activeProfileId || activeProfileId === GOAL_SIMULATOR_NEW_SENTINEL) {
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
