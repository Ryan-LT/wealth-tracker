import { describe, expect, it } from "vitest";

import { monthlyShareForDraft, resolveMonthlyShares } from "@/entities/goal/lib/monthly-share";
import { EMPTY_GOAL_PROFILE, type GoalProfile } from "@/entities/goal/model";

const plan = (id: string, extra: Partial<GoalProfile> = {}): GoalProfile => ({ ...EMPTY_GOAL_PROFILE, id, ...extra });

describe("resolveMonthlyShares", () => {
  it("splits evenly by default so savings are never double counted", () => {
    const s = resolveMonthlyShares([plan("a"), plan("b")]);
    expect(s.byPlan.get("a")).toBe(0.5);
    expect(s.byPlan.get("b")).toBe(0.5);
    expect(s.overAllocated).toBe(false);
  });

  it("plans that exclude income get nothing and don't dilute others", () => {
    const s = resolveMonthlyShares([plan("a"), plan("b", { includeMonthlyIncome: false })]);
    expect(s.byPlan.get("a")).toBe(1);
    expect(s.byPlan.get("b")).toBe(0);
  });

  it("explicit shares first, automatic plans split the rest", () => {
    const s = resolveMonthlyShares([plan("a", { monthlySharePct: 60 }), plan("b"), plan("c")]);
    expect(s.byPlan.get("a")).toBeCloseTo(0.6);
    expect(s.byPlan.get("b")).toBeCloseTo(0.2);
    expect(s.byPlan.get("c")).toBeCloseTo(0.2);
  });

  it("over 100 % is scaled down; under 100 % with no automatic plans leaves some unassigned", () => {
    const over = resolveMonthlyShares([plan("a", { monthlySharePct: 80 }), plan("b", { monthlySharePct: 80 }), plan("c")]);
    expect(over.overAllocated).toBe(true);
    expect(over.byPlan.get("a")).toBeCloseTo(0.5);
    expect(over.byPlan.get("c")).toBe(0);
    const under = resolveMonthlyShares([plan("a", { monthlySharePct: 30 }), plan("b", { monthlySharePct: 20 })]);
    expect(under.unassigned).toBeCloseTo(0.5);
  });

  it("a new draft takes part in the split", () => {
    expect(monthlyShareForDraft([plan("a")], plan(""))).toBe(0.5);
    expect(monthlyShareForDraft([plan("a"), plan("b")], plan("a", { monthlySharePct: 70 }))).toBeCloseTo(0.7);
  });
});
