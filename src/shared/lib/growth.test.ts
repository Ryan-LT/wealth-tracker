import { describe, expect, it } from "vitest";

import { futureValue, monthlyRate, monthsToReach, requiredMonthly } from "@/shared/lib/growth";

describe("growth", () => {
  it("monthly rate compounds back to the yearly rate", () => {
    expect(Math.pow(1 + monthlyRate(0.06), 12) - 1).toBeCloseTo(0.06, 10);
    expect(monthlyRate(0)).toBe(0);
  });

  it("zero rate is the linear model", () => {
    expect(futureValue(100, 10, 12)).toBe(220);
    expect(monthsToReach(100, 10, 220)).toBe(12);
    expect(requiredMonthly(100, 220, 12)).toBe(10);
  });

  it("compounds a lump sum and contributions", () => {
    // 1,000 at 6%/yr for 12 months → 1,060.
    expect(futureValue(1_000, 0, 12, 0.06)).toBeCloseTo(1_060, 6);
    // Annuity: 100/month for 12 months at 6%/yr.
    const r = monthlyRate(0.06);
    expect(futureValue(0, 100, 12, 0.06)).toBeCloseTo((100 * (Math.pow(1 + r, 12) - 1)) / r, 6);
  });

  it("monthsToReach and requiredMonthly invert futureValue", () => {
    const n = monthsToReach(5_000, 300, 20_000, 0.05);
    expect(futureValue(5_000, 300, n, 0.05)).toBeCloseTo(20_000, 4);
    const pmt = requiredMonthly(5_000, 20_000, 36, 0.05);
    expect(futureValue(5_000, pmt, 36, 0.05)).toBeCloseTo(20_000, 4);
  });

  it("never-reachable and already-there cases", () => {
    expect(monthsToReach(100, 0, 200)).toBe(Infinity);
    expect(monthsToReach(100, -10, 200, 0.05)).toBe(Infinity);
    expect(monthsToReach(300, 0, 200)).toBe(0);
    expect(requiredMonthly(1_000, 1_000, 12, 0.05)).toBe(0);
  });
});
