export type GoalProfile = {
  id: string;
  name: string;
  targetAmount: number;
  /** ISO date (yyyy-mm-dd). */
  targetDate: string;
  monthlyContribution: number;
  active?: boolean;
};

export type GoalsState = {
  /** The single primary goal shown on the Dashboard. */
  primary: {
    name: string;
    targetAmount: number;
    saved: number;
  };
  /** Multi-goal "Saved Profiles" — used by the Goal Simulator page. */
  profiles: GoalProfile[];
  /** ID of the currently-loaded profile in the Goal Simulator. */
  activeProfileId: string;
};

/** Draft-shaped defaults when there are no saved profiles yet. */
export const EMPTY_GOAL_PROFILE: GoalProfile = {
  id: "",
  name: "",
  targetAmount: 0,
  targetDate: "",
  monthlyContribution: 0,
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
