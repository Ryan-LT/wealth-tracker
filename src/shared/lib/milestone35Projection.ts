const MS_PER_MONTH = (1000 * 60 * 60 * 24 * 365.25) / 12;

/** Age target for the wealth milestone (years). */
export const MILESTONE_TARGET_AGE = 35;

/** Default goal in USD when env does not override. */
export const DEFAULT_MILESTONE_USD = 1_000_000;

export function thirtyFifthBirthday(dob: Date): Date {
  return new Date(dob.getFullYear() + MILESTONE_TARGET_AGE, dob.getMonth(), dob.getDate(), 23, 59, 59, 999);
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

/**
 * Ending balance after `months` periods: PV compounds monthly at `annualRate`,
 * plus a fixed contribution `pmt` at each month-end.
 */
export function futureValueWithMonthlyContributions(
  pv: number,
  pmt: number,
  annualRate: number,
  months: number,
): number {
  if (!Number.isFinite(pv) || !Number.isFinite(pmt) || !Number.isFinite(annualRate)) {
    return pv;
  }
  if (months <= 0) return pv;
  const rm = annualRate / 12;
  if (Math.abs(rm) < 1e-12) {
    return pv + pmt * months;
  }
  const factor = (1 + rm) ** months;
  return pv * factor + pmt * ((factor - 1) / rm);
}

export type Milestone35Feasibility = {
  projectedEndingNetWorth: number;
  /** True when projected balance meets or exceeds the VND target. */
  feasible: boolean;
  monthsRemaining: number;
};

export function evaluateMilestone35Feasibility(input: {
  currentNetWorth: number;
  monthlyNetContribution: number;
  annualRealReturn: number;
  targetNetWorthVnd: number;
  deadline: Date;
  now?: Date;
}): Milestone35Feasibility {
  const now = input.now ?? new Date();
  const monthsRemaining = monthsBetween(now, input.deadline);
  const projectedEndingNetWorth = futureValueWithMonthlyContributions(
    input.currentNetWorth,
    input.monthlyNetContribution,
    input.annualRealReturn,
    monthsRemaining,
  );
  const feasible = projectedEndingNetWorth >= input.targetNetWorthVnd;
  return { projectedEndingNetWorth, feasible, monthsRemaining };
}
