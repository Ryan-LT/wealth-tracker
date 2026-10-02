/**
 * Compound growth with monthly contributions, shared by goal plans, the
 * net-worth milestone and the financial-independence estimate.
 *
 * Rates are yearly fractions (0.05 = 5%/year), compounded monthly; months may
 * be fractional. A rate of 0 reduces to the plain linear model
 * `start + monthly × months`.
 */

/** Equivalent monthly rate for a yearly rate: (1 + r)^(1/12) − 1. */
export function monthlyRate(annualRate: number): number {
  if (!Number.isFinite(annualRate) || annualRate === 0) return 0;
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

/** Balance after `months` of growth plus a contribution at the end of each month. */
export function futureValue(start: number, monthly: number, months: number, annualRate = 0): number {
  const n = Math.max(0, months);
  const r = monthlyRate(annualRate);
  if (r === 0) return start + monthly * n;
  const g = Math.pow(1 + r, n);
  return start * g + monthly * ((g - 1) / r);
}

/** Months until the balance first reaches `target` (`Infinity` if it never does). */
export function monthsToReach(start: number, monthly: number, target: number, annualRate = 0): number {
  if (start >= target) return 0;
  const r = monthlyRate(annualRate);
  if (r === 0) return monthly > 0 ? (target - start) / monthly : Infinity;
  // Solve start·g + monthly·(g − 1)/r = target for g = (1 + r)^n.
  const denominator = start * r + monthly;
  if (denominator <= 0) return Infinity;
  const g = (target * r + monthly) / denominator;
  return g > 1 ? Math.log(g) / Math.log(1 + r) : 0;
}

/** Monthly contribution needed to reach `target` in `months` (0 when growth alone gets there). */
export function requiredMonthly(start: number, target: number, months: number, annualRate = 0): number {
  const n = Math.max(months, 1 / 30);
  const r = monthlyRate(annualRate);
  if (r === 0) return Math.max(0, (target - start) / n);
  const g = Math.pow(1 + r, n);
  return Math.max(0, ((target - start * g) * r) / (g - 1));
}
