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

export const GOALS_SEED: GoalsState = {
  primary: {
    name: "New House Fund",
    targetAmount: 200_000_000,
    saved: 130_000_000,
  },
  profiles: [
    {
      id: "vacation-home",
      name: "Vacation Home",
      targetAmount: 500_000_000,
      targetDate: "2028-06-30",
      monthlyContribution: 4_250_000,
      active: true,
    },
    {
      id: "retirement",
      name: "Retirement Fund",
      targetAmount: 20_000_000_000,
      targetDate: "2035-12-31",
      monthlyContribution: 12_500_000,
    },
  ],
  activeProfileId: "vacation-home",
};
