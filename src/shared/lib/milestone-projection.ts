import { futureValue } from "@/shared/lib/growth";

const MS_PER_MONTH = (1000 * 60 * 60 * 24 * 365.25) / 12;

/** Default age target for the wealth milestone (years) until the user sets their own. */
export const DEFAULT_MILESTONE_AGE = 35;
export const MIN_MILESTONE_AGE = 18;
export const MAX_MILESTONE_AGE = 100;

/** Default goal in USD until the user sets their own. */
export const DEFAULT_MILESTONE_USD = 1_000_000;

/** End of the day the person turns `age` (29 Feb birthdays fall on 28 Feb in non-leap years). */
export function birthdayAtAge(dob: Date, age: number): Date {
  const year = dob.getFullYear() + age;
  const lastDayOfMonth = new Date(year, dob.getMonth() + 1, 0).getDate();
  return new Date(year, dob.getMonth(), Math.min(dob.getDate(), lastDayOfMonth), 23, 59, 59, 999);
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
  /** Yearly real (after-inflation) return, as a fraction; default 0 (no growth). */
  annualRealRate?: number;
  now?: Date;
}): MilestoneFeasibility {
  const now = input.now ?? new Date();
  const monthsRemaining = monthsBetween(now, input.deadline);
  // Positive net worth and new savings grow at the real return; a negative net
  // worth (debt) is carried as-is rather than compounded.
  const projectedEndingNetWorth =
    futureValue(Math.max(0, input.currentNetWorth), input.monthlyNetContribution, monthsRemaining, input.annualRealRate ?? 0) +
    Math.min(0, input.currentNetWorth);
  const feasible = projectedEndingNetWorth >= input.targetNetWorthVnd;
  return { projectedEndingNetWorth, feasible, monthsRemaining };
}
