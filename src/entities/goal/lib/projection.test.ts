import { describe, expect, it } from "vitest";

import {
  computeGoalProjection,
  describeGoalProjectionNote,
  evaluateStartingOnlyStatus,
  goalProjectionNoteTone,
  monthsToTargetRounded,
} from "@/entities/goal/lib/projection";

const now = new Date("2026-01-01T12:00:00+07:00");
const fmt = (n: number) => `${n}₫`;

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

describe("monthsToTargetRounded", () => {
  it("rounds, floors at 1 and handles empty/invalid", () => {
    expect(monthsToTargetRounded("2027-01-01", now)).toBe(12);
    expect(monthsToTargetRounded("2025-01-01", now)).toBe(1);
    expect(monthsToTargetRounded("", now)).toBe(1);
    expect(monthsToTargetRounded("nope", now)).toBe(1);
    expect(monthsToTargetRounded(undefined, now)).toBe(1);
  });
});

describe("computeGoalProjection", () => {
  it("projects with income", () => {
    const p = project({});
    expect(p).toMatchObject({
      monthsToTarget: 12,
      applyMonthlyIncome: true,
      effectiveMonthlyContribution: 100,
      projectedAtTarget: 1_300,
      status: "feasible",
      incomeOffsetBySpending: false,
      note: { kind: "ahead", surplus: 300 },
    });
  });

  it("covers every note branch", () => {
    expect(project({ targetAmount: 0 }).note).toEqual({ kind: "incomplete" });
    expect(project({ targetAmount: 0 }).status).toBe("unset");
    expect(project({ targetDateIso: "" }).note).toEqual({ kind: "incomplete" });
    expect(project({ incomeMonthly: 0, householdMonthlyNet: 0 }).note).toEqual({ kind: "no_income" });
    expect(project({ householdMonthlyNet: -10 }).note).toEqual({ kind: "non_positive_net" });
    const off = project({ includeMonthlyIncome: false });
    expect(off.effectiveMonthlyContribution).toBe(0);
    expect(off.incomeOffsetBySpending).toBe(true);
    expect(off.note).toEqual({ kind: "income_off_short", flatAt: 100, gap: 900 });
    expect(project({ startingBalance: 1_000, householdMonthlyNet: 0 }).note).toEqual({ kind: "on_target" });
    expect(project({ householdMonthlyNet: 50 }).note).toEqual({ kind: "short", gap: 300 });
    expect(project({ householdMonthlyNet: 50 }).status).toBe("shortfall");
  });

  it("describes notes with the given formatter", () => {
    expect(describeGoalProjectionNote({ kind: "incomplete" }, fmt)).toBe("Add target, date, and starting sources.");
    expect(describeGoalProjectionNote({ kind: "income_off_short", flatAt: 1, gap: 2 }, fmt)).toBe(
      "Income off for this plan — flat at 1₫; short ~2₫.",
    );
    expect(describeGoalProjectionNote({ kind: "ahead", surplus: 5 }, fmt)).toBe("Ahead by ~5₫.");
    expect(describeGoalProjectionNote({ kind: "on_target" }, fmt)).toBe("On target.");
    expect(describeGoalProjectionNote({ kind: "short", gap: 3 }, fmt)).toBe("Short ~3₫ vs target.");
    expect(goalProjectionNoteTone({ kind: "short", gap: 3 })).toBe("danger");
    expect(goalProjectionNoteTone({ kind: "ahead", surplus: 3 })).toBe("success");
    expect(goalProjectionNoteTone({ kind: "no_income" })).toBe("warning");
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
