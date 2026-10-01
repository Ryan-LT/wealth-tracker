import { describe, expect, it } from "vitest";

import {
  EMPTY_GOAL_PROFILE,
  GOAL_PLAN_NEW_SENTINEL,
  type GoalsState,
} from "@/entities/goal/model";
import {
  normalizeGoalProfile,
  removeGoalPlan,
  resolvePlanEditorProfile,
  revertPlanSection,
  upsertGoalPlan,
} from "@/entities/goal/lib/plan-editor";
import { buildGoalStartingOptions } from "@/entities/goal/lib/starting-options";
import {
  fixtureAssets,
  fixtureCatalog,
  fixtureGoals,
  planCar,
  planHouse,
  planLegacy,
} from "@/test/fixtures/tables";

const seedOptions = buildGoalStartingOptions(fixtureAssets, fixtureCatalog);
const seedKeys = new Set(seedOptions.map((o) => o.key));
const ctx = { seedKeys, seedOptions, incomeMonthly: 61_500_000, newId: () => "goal-999" };

describe("resolvePlanEditorProfile", () => {
  it("picks the active plan, falls back to the first, or empty for new", () => {
    expect(resolvePlanEditorProfile(fixtureGoals).id).toBe("goal-1");
    expect(resolvePlanEditorProfile({ ...fixtureGoals, activeProfileId: "goal-2" }).id).toBe("goal-2");
    expect(resolvePlanEditorProfile({ ...fixtureGoals, activeProfileId: "" }).id).toBe("goal-1");
    expect(resolvePlanEditorProfile({ ...fixtureGoals, activeProfileId: "gone" }).id).toBe("goal-1");
    expect(
      resolvePlanEditorProfile({ ...fixtureGoals, activeProfileId: GOAL_PLAN_NEW_SENTINEL }),
    ).toBe(EMPTY_GOAL_PROFILE);
    expect(resolvePlanEditorProfile({ ...fixtureGoals, profiles: [] })).toBe(EMPTY_GOAL_PROFILE);
  });
});

describe("normalizeGoalProfile", () => {
  it("migrates legacy seeds and defaults keyed amounts", () => {
    const n = normalizeGoalProfile(planLegacy, seedKeys, seedOptions, [planHouse, planCar]);
    expect(n.seedLines).toEqual([{ id: "migrated-seed", sourceKey: "cash:c1", amount: 200_000_000 }]);
    expect(n.checkpoints).toEqual([]);
    expect(n.includeMonthlyIncome).toBe(true);
    expect(n.monthlyContribution).toBe(0);
  });
});

describe("upsertGoalPlan", () => {
  it("creates a new plan with a fresh id, clamps lines and activates it", () => {
    const prev: GoalsState = { ...fixtureGoals, activeProfileId: GOAL_PLAN_NEW_SENTINEL };
    const next = upsertGoalPlan(
      prev,
      {
        ...EMPTY_GOAL_PROFILE,
        name: "  Trip  ",
        targetAmount: 50_000_000,
        targetDate: "2027-03-01",
        seedLines: [
          { id: "n1", sourceKey: "catalog:a1", amount: 80_000_000 },
          { id: "n2", sourceKey: "catalog:gone", amount: 5 },
        ],
        checkpoints: [{ id: "c", date: "2026-10-01", amount: 1.5, paid: false }],
      },
      ctx,
    );
    expect(next.activeProfileId).toBe("goal-999");
    expect(next.profiles).toHaveLength(3);
    expect(next.profiles[2]).toEqual({
      id: "goal-999",
      name: "Trip",
      targetAmount: 50_000_000,
      targetDate: "2027-03-01",
      monthlyContribution: 61_500_000,
      includeMonthlyIncome: true,
      // a1 live 300M − 250M (House) − 200M (Car) → 0 left
      seedLines: [{ id: "n1", sourceKey: "catalog:a1", amount: 0 }],
      checkpoints: [{ id: "c", date: "2026-10-01", amount: 1 }],
    });
  });

  it("replaces an existing plan in place and keeps unknown stored keys", () => {
    const next = upsertGoalPlan(
      { ...fixtureGoals, profiles: [{ ...planHouse, active: true }, planCar] },
      { ...planHouse, name: "", includeMonthlyIncome: false },
      ctx,
    );
    expect(next.profiles.map((p) => p.id)).toEqual(["goal-1", "goal-2"]);
    expect(next.profiles[0]).toMatchObject({
      name: "Untitled plan",
      includeMonthlyIncome: false,
      active: true,
      monthlyContribution: 61_500_000,
    });
    expect(next.profiles[0].seedLines).toEqual([
      { id: "s1", sourceKey: "catalog:a1", amount: 100_000_000 },
      { id: "s2", sourceKey: "catalog:a3", amount: 500_000_000 },
      { id: "s3", sourceKey: "custom", amount: 10_000_000 },
    ]);
    expect(next.activeProfileId).toBe("goal-1");
  });
});

describe("removeGoalPlan", () => {
  it("falls back to the first remaining plan or a new draft", () => {
    expect(removeGoalPlan(fixtureGoals, "goal-1").activeProfileId).toBe("goal-2");
    expect(removeGoalPlan(fixtureGoals, "goal-2").activeProfileId).toBe("goal-1");
    const single: GoalsState = { ...fixtureGoals, profiles: [planHouse] };
    expect(removeGoalPlan(single, "goal-1")).toMatchObject({
      profiles: [],
      activeProfileId: GOAL_PLAN_NEW_SENTINEL,
    });
    expect(
      removeGoalPlan({ ...fixtureGoals, activeProfileId: GOAL_PLAN_NEW_SENTINEL }, "goal-1")
        .activeProfileId,
    ).toBe(GOAL_PLAN_NEW_SENTINEL);
    expect(removeGoalPlan({ ...fixtureGoals, activeProfileId: "" }, "goal-1").activeProfileId).toBe("");
  });
});

describe("revertPlanSection", () => {
  it("restores only the given section", () => {
    const draft = { ...planHouse, name: "X", targetAmount: 1, targetDate: "2030-01-01", includeMonthlyIncome: false };
    expect(revertPlanSection(draft, planHouse, "basics")).toMatchObject({
      name: "House",
      targetAmount: 2_000_000_000,
      targetDate: "2028-06-30",
      includeMonthlyIncome: false,
    });
    expect(revertPlanSection(draft, planHouse, "income")).toMatchObject({
      name: "X",
      includeMonthlyIncome: true,
    });
  });
});
