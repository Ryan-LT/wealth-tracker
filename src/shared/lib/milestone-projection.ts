const MS_PER_MONTH = (1000 * 60 * 60 * 24 * 365.25) / 12;

/** Default age target for the wealth milestone (years) until the user sets their own. */
export const DEFAULT_MILESTONE_AGE = 35;
export const MIN_MILESTONE_AGE = 18;
export const MAX_MILESTONE_AGE = 100;

/** Default goal in USD until the user sets their own. */
export const DEFAULT_MILESTONE_USD = 1_000_000;

/** End of the day the person turns `age`. */
export function birthdayAtAge(dob: Date, age: number): Date {
  return new Date(dob.getFullYear() + age, dob.getMonth(), dob.getDate(), 23, 59, 59, 999);
}

/** Parse `YYYY-MM-DD` birth dates for stable local-ish noon handling. */
export function parseIsoDateOnly(iso: string): Date | null {
  const raw = iso.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function monthsBetween(from: Date, to: Date): number {
  return Math.max(0, (to.getTime() - from.getTime()) / MS_PER_MONTH);
}

export type MilestoneFeasibility = {
  projectedEndingNetWorth: number;
  /** True when projected balance meets or exceeds the VND target. */
  feasible: boolean;
  monthsRemaining: number;
};

export function evaluateMilestoneFeasibility(input: {
  currentNetWorth: number;
  monthlyNetContribution: number;
  targetNetWorthVnd: number;
  deadline: Date;
  now?: Date;
}): MilestoneFeasibility {
  const now = input.now ?? new Date();
  const monthsRemaining = monthsBetween(now, input.deadline);
  const projectedEndingNetWorth =
    input.currentNetWorth + input.monthlyNetContribution * monthsRemaining;
  const feasible = projectedEndingNetWorth >= input.targetNetWorthVnd;
  return { projectedEndingNetWorth, feasible, monthsRemaining };
}
