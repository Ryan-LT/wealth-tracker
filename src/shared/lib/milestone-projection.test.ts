import { describe, expect, it } from "vitest";

import {
  birthdayAtAge,
  evaluateMilestoneFeasibility,
  monthsBetween,
  parseIsoDateOnly,
} from "@/shared/lib/milestone-projection";

describe("milestone projection", () => {
  it("parses DOB and computes the target birthday end-of-day", () => {
    expect(parseIsoDateOnly("1995-02-03")?.toISOString()).toBe("1995-02-03T05:00:00.000Z");
    expect(parseIsoDateOnly("1995-2-3")).toBeNull();
    const dob = parseIsoDateOnly("1995-02-03")!;
    expect(birthdayAtAge(dob, 35).toISOString()).toBe("2030-02-03T16:59:59.999Z");
    expect(birthdayAtAge(dob, 40).toISOString()).toBe("2035-02-03T16:59:59.999Z");
  });

  it("projects linearly", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const deadline = new Date("2027-01-01T00:00:00Z");
    expect(monthsBetween(now, deadline)).toBeCloseTo(11.9918, 3);
    expect(monthsBetween(deadline, now)).toBe(0);
    const r = evaluateMilestoneFeasibility({
      currentNetWorth: 1_000,
      monthlyNetContribution: 100,
      targetNetWorthVnd: 2_200,
      deadline,
      now,
    });
    expect(r.feasible).toBe(false);
    expect(r.projectedEndingNetWorth).toBeCloseTo(1_000 + 100 * 11.9918, 1);
  });
});
