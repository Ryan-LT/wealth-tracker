import { describe, expect, it } from "vitest";

import { EMPTY_GOAL_PROFILE, type GoalsState } from "@/entities/goal/model";
import {
  checkpointsWithRunningTotal,
  createCheckpointId,
  setCheckpointPaid,
} from "@/entities/goal/lib/checkpoints";
import { buildGoalPlanSummaries, goalProgressPercent } from "@/entities/goal/lib/plan-summaries";
import {
  addableSeedOptions,
  seedLineAllocationView,
  sourceAvailability,
} from "@/entities/goal/lib/seed-lines";
import { buildGoalStartingOptions } from "@/entities/goal/lib/starting-options";
import {
  fixtureAssets,
  fixtureCatalog,
  fixtureGoals,
  planCar,
  planHouse,
} from "@/test/fixtures/tables";

const options = buildGoalStartingOptions(fixtureAssets, fixtureCatalog);
const saved = [planHouse, planCar];

describe("checkpoint helpers", () => {
  it("adds running totals in date order", () => {
    expect(
      checkpointsWithRunningTotal([
        { id: "b", date: "2026-02-01", amount: 5.5 },
        { id: "a", date: "2026-01-01T00:00", amount: 10 },
        { id: "z", date: " ", amount: 99 },
      ]).map((c) => [c.id, c.date, c.amount, c.running]),
    ).toEqual([
      ["a", "2026-01-01", 10, 10],
      ["b", "2026-02-01", 5, 15],
    ]);
  });

  it("toggles paid and drops the key when unpaid", () => {
    const cps = [{ id: "a", date: "2026-01-01", amount: 1, paid: true }, { id: "b", date: "2026-02-01", amount: 2 }];
    expect(setCheckpointPaid(cps, "b", true)[1]).toEqual({ id: "b", date: "2026-02-01", amount: 2, paid: true });
    const unpaid = setCheckpointPaid(cps, "a", false)[0];
    expect(unpaid).toEqual({ id: "a", date: "2026-01-01", amount: 1 });
    expect("paid" in unpaid).toBe(false);
    expect(createCheckpointId()).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe("allocation editor views", () => {
  it("lists addable options", () => {
    const keys = addableSeedOptions(options, [
      { id: "1", sourceKey: "catalog:a1", amount: 1 },
      { id: "2", sourceKey: "custom", amount: 1 },
    ]).map((o) => o.key);
    expect(keys).not.toContain("none");
    expect(keys).not.toContain("catalog:a1");
    expect(keys).toContain("custom");
    expect(keys).toContain("catalog:a2");
  });

  it("computes source availability", () => {
    const a1 = options.find((o) => o.key === "catalog:a1")!;
    const draft = { ...EMPTY_GOAL_PROFILE, id: "goal-new" };
    expect(sourceAvailability(a1, saved, draft)).toMatchObject({
      live: 300_000_000,
      reservedElsewhere: 450_000_000,
      remaining: 0,
      fullyReserved: true,
      empty: false,
    });
    const a4 = options.find((o) => o.key === "catalog:a4")!;
    expect(sourceAvailability(a4, saved, draft)).toMatchObject({ live: 0, empty: true, fullyReserved: false });
  });

  it("describes a seed line", () => {
    const v = seedLineAllocationView(planCar.seedLines![0], options, saved, planCar);
    expect(v).toMatchObject({
      title: "Emergency fund",
      category: "Cash",
      liquidity: "instant",
      isCustom: false,
      live: 300_000_000,
      maxAlloc: 50_000_000,
      effective: 50_000_000,
      availableToPlan: 0,
      over: true,
      availabilityTone: "danger",
    });
    expect(v.usage.map((u) => u.planId)).toEqual(["goal-1"]);
    const custom = seedLineAllocationView(planHouse.seedLines![2], options, saved, planHouse);
    expect(custom).toMatchObject({ isCustom: true, maxAlloc: Number.POSITIVE_INFINITY, effective: 10_000_000, over: false, usage: [] });
  });
});

describe("plan summaries", () => {
  it("summarizes saved plans", () => {
    expect(buildGoalPlanSummaries(fixtureGoals, options, 0)).toEqual([
      {
        key: "goal-1",
        planId: "goal-1",
        name: "House",
        targetAmount: 2_000_000_000,
        saved: 610_000_000,
        savedCaption: "Allocated starting",
        targetDate: "2028-06-30",
        includeMonthlyIncome: true,
      },
      {
        key: "goal-2",
        planId: "goal-2",
        name: "Untitled plan",
        targetAmount: 800_000_000,
        saved: 50_000_000,
        savedCaption: "Allocated starting",
        targetDate: "2027-01-15",
        includeMonthlyIncome: false,
      },
    ]);
  });

  it("falls back to the legacy primary goal", () => {
    const legacy: GoalsState = { primary: { name: " Old ", targetAmount: 1_000, saved: 0 }, profiles: [], activeProfileId: "" };
    expect(buildGoalPlanSummaries(legacy, options, 400)).toEqual([
      {
        key: "legacy-primary",
        name: "Old",
        targetAmount: 1_000,
        saved: 400,
        savedCaption: "Saved",
        targetDate: "",
        includeMonthlyIncome: true,
      },
    ]);
    expect(buildGoalPlanSummaries({ ...legacy, primary: { ...legacy.primary, saved: 5_000 } }, options, 400)[0].saved).toBe(1_000);
    expect(buildGoalPlanSummaries({ ...legacy, primary: { ...legacy.primary, name: "" } }, options, 0)[0].name).toBe("Primary Goal");
  });

  it("progress percent", () => {
    expect(goalProgressPercent(50, 200)).toBe(25);
    expect(goalProgressPercent(5, 0)).toBe(0);
    expect(goalProgressPercent(300, 200)).toBe(150);
  });
});
