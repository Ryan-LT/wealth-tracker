import { describe, expect, it } from "vitest";

import {
  computeGoalProjection,
  describeGoalProjectionNote,
  evaluateStartingOnlyStatus,
  goalProjectionNoteTone,
  isTargetDatePast,
  monthsUntilTarget,
} from "@/entities/goal/lib/projection";

const now = new Date("2026-01-01T12:00:00+07:00");
const fmt = (n: number) => `${n}₫`;
/** 365 days in average months. */
const YEAR_MONTHS = 365 / (365.25 / 12);

function project(over: Partial<Parameters<typeof computeGoalProjection>[0]>) {
  return computeGoalProjection({
    startingBalance: 100,
    targetAmount: 1_000,
    targetDateIso: "2027-01-01",
    includeMonthlyIncome: true,
    incomeMonthly: 200,
    householdMonthlyNet: 100,
    now,
    ...over,
  });
}

describe("monthsUntilTarget", () => {
  it("is fractional, 0 when passed or missing", () => {
    expect(monthsUntilTarget("2027-01-01", now)).toBeCloseTo(YEAR_MONTHS, 6);
    expect(monthsUntilTarget("2026-02-15", now)).toBeCloseTo(45 / (365.25 / 12), 6);
    expect(monthsUntilTarget("2025-01-01", now)).toBe(0);
    expect(monthsUntilTarget("", now)).toBe(0);
    expect(monthsUntilTarget("nope", now)).toBe(0);
    expect(monthsUntilTarget(undefined, now)).toBe(0);
  });

  it("a date is past only after that day ends", () => {
    expect(isTargetDatePast("2026-01-01", now)).toBe(false);
    expect(isTargetDatePast("2025-12-31", now)).toBe(true);
  });
});

describe("computeGoalProjection", () => {
  it("projects with income (same months as the chart)", () => {
    const p = project({});
    expect(p.monthsToTarget).toBeCloseTo(YEAR_MONTHS, 6);
    expect(p.projectedAtTarget).toBeCloseTo(100 + 100 * YEAR_MONTHS, 6);
    expect(p).toMatchObject({ applyMonthlyIncome: true, effectiveMonthlyContribution: 100, status: "feasible", pastDue: false });
    expect(p.note.kind).toBe("ahead");
  });

  it("a passed date counts no more savings", () => {
    const p = project({ targetDateIso: "2025-06-01", startingBalance: 900 });
    expect(p).toMatchObject({ pastDue: true, projectedAtTarget: 900, status: "shortfall", note: { kind: "past_due", gap: 100 } });
    expect(project({ targetDateIso: "2025-06-01", startingBalance: 1_000 }).status).toBe("feasible");
  });

  it("uses only this plan's share of the monthly net", () => {
    const p = project({ monthlyShare: 0.5 });
    expect(p.effectiveMonthlyContribution).toBe(50);
    expect(p.projectedAtTarget).toBeCloseTo(100 + 50 * YEAR_MONTHS, 6);
    expect(project({ monthlyShare: 0 }).note).toEqual({ kind: "no_share" });
  });

  it("compounds with an expected return", () => {
    const flat = project({ householdMonthlyNet: 0, includeMonthlyIncome: false, startingBalance: 1_000, targetAmount: 2_000 });
    const grown = project({ householdMonthlyNet: 0, includeMonthlyIncome: false, startingBalance: 1_000, targetAmount: 2_000, expectedReturnPct: 6 });
    expect(flat.projectedAtTarget).toBe(1_000);
    expect(grown.projectedAtTarget).toBeCloseTo(1_000 * Math.pow(1.06, YEAR_MONTHS / 12), 4);
  });

  it("covers every note branch", () => {
    expect(project({ targetAmount: 0 }).note).toEqual({ kind: "incomplete" });
    expect(project({ targetAmount: 0 }).status).toBe("unset");
    expect(project({ targetDateIso: "" }).note).toEqual({ kind: "incomplete" });
    expect(project({ incomeMonthly: 0, householdMonthlyNet: 0 }).note).toEqual({ kind: "no_income" });
    expect(project({ householdMonthlyNet: -10 }).note).toEqual({ kind: "non_positive_net" });
    const off = project({ includeMonthlyIncome: false });
    expect(off.effectiveMonthlyContribution).toBe(0);
    expect(off.note).toEqual({ kind: "income_off_short", flatAt: 100, gap: 900 });
    expect(project({ startingBalance: 1_000, householdMonthlyNet: 0 }).note).toEqual({ kind: "on_target" });
    const short = project({ householdMonthlyNet: 50 });
    expect(short.status).toBe("shortfall");
    expect(short.note.kind).toBe("short");
  });

  it("describes notes with the given formatter", () => {
    expect(describeGoalProjectionNote({ kind: "incomplete" }, fmt)).toBe("Add target, date, and starting sources.");
    expect(describeGoalProjectionNote({ kind: "income_off_short", flatAt: 1, gap: 2 }, fmt)).toBe(
      "Income off for this plan — reaches 1₫; short ~2₫.",
    );
    expect(describeGoalProjectionNote({ kind: "past_due", gap: 4 }, fmt)).toMatch(/date has passed — still short ~4₫/);
    expect(describeGoalProjectionNote({ kind: "ahead", surplus: 5 }, fmt)).toBe("Ahead by ~5₫.");
    expect(describeGoalProjectionNote({ kind: "on_target" }, fmt)).toBe("On target.");
    expect(describeGoalProjectionNote({ kind: "short", gap: 3 }, fmt)).toBe("Short ~3₫ vs target.");
    expect(goalProjectionNoteTone({ kind: "short", gap: 3 })).toBe("danger");
    expect(goalProjectionNoteTone({ kind: "past_due", gap: 3 })).toBe("danger");
    expect(goalProjectionNoteTone({ kind: "ahead", surplus: 3 })).toBe("success");
    expect(goalProjectionNoteTone({ kind: "no_income" })).toBe("warning");
    expect(goalProjectionNoteTone({ kind: "no_share" })).toBe("warning");
  });
});

describe("evaluateStartingOnlyStatus", () => {
  it("compares starting balance to target", () => {
    expect(evaluateStartingOnlyStatus(5, 0)).toEqual({ kind: "no_target" });
    expect(evaluateStartingOnlyStatus(15, 10)).toEqual({ kind: "met", surplus: 5 });
    expect(evaluateStartingOnlyStatus(10, 10)).toEqual({ kind: "met", surplus: 0 });
    expect(evaluateStartingOnlyStatus(4, 10)).toEqual({ kind: "short", gap: 6 });
  });
});
