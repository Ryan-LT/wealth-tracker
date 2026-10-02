import { afterEach, describe, expect, it, vi } from "vitest";

import { EMPTY_GOAL_PROFILE, type GoalProfile } from "@/entities/goal/model";
import { buildGoalStartingOptions } from "@/entities/goal/lib/starting-options";
import {
  appendGoalSeedLine,
  clampSeedLinesToAllocationPool,
  dedupeNonCustomSeedLines,
  effectiveGoalSeedLineAmount,
  ensureKeyedSeedDefaults,
  goalUsageForSourceKey,
  labelForSeedLine,
  liveBalanceForSourceKey,
  maxAllocationForSourceKey,
  migrateLegacySeedsToLines,
  sanitizeSeedLinesAgainstOptions,
  totalGoalStartingBalance,
} from "@/entities/goal/lib/seed-lines";
import {
  fixtureAssets,
  fixtureCatalog,
  planCar,
  planHouse,
  planLegacy,
} from "@/test/fixtures/tables";

const options = buildGoalStartingOptions(fixtureAssets, fixtureCatalog);
const keys = new Set(options.map((o) => o.key));
const saved = [planHouse, planCar];

afterEach(() => {
  vi.useRealTimers();
});

describe("migrateLegacySeedsToLines", () => {
  it("keeps stored lines, filling ids and amounts", () => {
    const lines = migrateLegacySeedsToLines({
      ...EMPTY_GOAL_PROFILE,
      seedLines: [
        { id: "x", sourceKey: "custom", amount: 5 },
        { id: "", sourceKey: "catalog:a1", amount: undefined as unknown as number },
      ],
    });
    expect(lines[0]).toEqual({ id: "x", sourceKey: "custom", amount: 5 });
    expect(lines[1].id).toMatch(/^seed-[a-z0-9]+$/);
    expect(lines[1]).toMatchObject({ sourceKey: "catalog:a1", amount: 0 });
  });

  it("converts legacy single-seed fields", () => {
    expect(migrateLegacySeedsToLines(planLegacy)).toEqual([
      { id: "migrated-seed", sourceKey: "cash:c1", amount: 0 },
    ]);
    expect(migrateLegacySeedsToLines(EMPTY_GOAL_PROFILE)).toEqual([]);
    expect(
      migrateLegacySeedsToLines({ ...EMPTY_GOAL_PROFILE, seedLines: undefined, seedAmount: 7 }),
    ).toEqual([{ id: "migrated-seed", sourceKey: "none", amount: 7 }]);
  });
});

describe("sanitize / dedupe", () => {
  it("drops unknown + none keys, keeps custom, dedupes keyed lines", () => {
    const lines = [
      { id: "1", sourceKey: "catalog:a1", amount: 1 },
      { id: "2", sourceKey: "catalog:a1", amount: 2 },
      { id: "3", sourceKey: "custom", amount: 3 },
      { id: "4", sourceKey: "custom", amount: 4 },
      { id: "5", sourceKey: "none", amount: 5 },
      { id: "6", sourceKey: "catalog:gone", amount: 6 },
    ];
    expect(sanitizeSeedLinesAgainstOptions(lines, keys).map((l) => l.id)).toEqual(["1", "3", "4"]);
    expect(dedupeNonCustomSeedLines(lines).map((l) => l.id)).toEqual(["1", "3", "4", "5", "6"]);
  });
});

describe("allocation pool math", () => {
  it("live balance", () => {
    expect(liveBalanceForSourceKey("catalog:a1", options)).toBe(300_000_000);
    expect(liveBalanceForSourceKey("catalog:a4", options)).toBe(0);
    expect(liveBalanceForSourceKey("custom", options)).toBe(0);
    expect(liveBalanceForSourceKey("none", options)).toBe(0);
    expect(liveBalanceForSourceKey("missing", options)).toBe(0);
  });

  it("caps a plan to live balance minus other plans' claims", () => {
    // a1 live 300M; House holds 250M, Car holds 200M.
    expect(maxAllocationForSourceKey("catalog:a1", options, saved, planCar, "s4")).toBe(50_000_000);
    expect(maxAllocationForSourceKey("catalog:a1", options, saved, planHouse, "s1")).toBe(100_000_000);
    expect(effectiveGoalSeedLineAmount(planHouse.seedLines![2], options, saved, planHouse)).toBe(10_000_000);
  });

  it("over-reserved source: plans share the live balance proportionally (sum = live)", () => {
    // 450M reserved against 300M live → each plan counts 300/450 of its reservation.
    const car = effectiveGoalSeedLineAmount(planCar.seedLines![0], options, saved, planCar);
    const house = effectiveGoalSeedLineAmount(planHouse.seedLines![0], options, saved, planHouse);
    expect(car).toBe(133_333_333);
    expect(house).toBe(166_666_666);
    expect(car + house).toBeLessThanOrEqual(300_000_000);
    expect(300_000_000 - (car + house)).toBeLessThan(2);
  });

  it("within-balance reservations count in full", () => {
    const solo = [planHouse];
    expect(effectiveGoalSeedLineAmount(planHouse.seedLines![0], options, solo, planHouse)).toBe(250_000_000);
  });

  it("totals starting balance with caps", () => {
    expect(totalGoalStartingBalance(planHouse.seedLines, options, saved, planHouse)).toBe(
      166_666_666 + 500_000_000 + 10_000_000,
    );
    expect(totalGoalStartingBalance(undefined, options, saved, planHouse)).toBe(0);
  });

  it("clamps and seeds defaults", () => {
    expect(clampSeedLinesToAllocationPool(planCar.seedLines!, options, saved, planCar)).toEqual([
      { id: "s4", sourceKey: "catalog:a1", amount: 50_000_000 },
    ]);
    const draft: GoalProfile = {
      ...EMPTY_GOAL_PROFILE,
      id: "goal-new",
      seedLines: [
        { id: "z1", sourceKey: "catalog:a2", amount: 0 },
        { id: "z2", sourceKey: "catalog:a1", amount: 999_000_000 },
        { id: "z3", sourceKey: "custom", amount: 0 },
      ],
    };
    expect(ensureKeyedSeedDefaults(draft.seedLines!, options, saved, draft)).toEqual([
      { id: "z1", sourceKey: "catalog:a2", amount: 150_000_000 },
      // 300M live − (250M + 200M) claimed elsewhere → 0
      { id: "z2", sourceKey: "catalog:a1", amount: 0 },
      { id: "z3", sourceKey: "custom", amount: 0 },
    ]);
  });

  it("reports usage per plan", () => {
    expect(goalUsageForSourceKey("catalog:a1", saved, planHouse)).toEqual([
      { planId: "goal-2", planName: "Untitled plan", amount: 200_000_000, isDraft: false },
    ]);
    expect(
      goalUsageForSourceKey("catalog:a1", saved, planHouse, { includeDraft: true, excludeLineId: "nope" }),
    ).toEqual([
      { planId: "goal-2", planName: "Untitled plan", amount: 200_000_000, isDraft: false },
      { planId: "goal-1", planName: "House", amount: 250_000_000, isDraft: true },
    ]);
    expect(goalUsageForSourceKey("custom", saved, planHouse)).toEqual([]);
  });

  it("labels", () => {
    expect(labelForSeedLine({ id: "1", sourceKey: "custom", amount: 0 }, options)).toBe("Custom amount");
    expect(labelForSeedLine({ id: "1", sourceKey: "catalog:a2", amount: 0 }, options)).toBe("Gold bars");
    expect(labelForSeedLine({ id: "1", sourceKey: "gone", amount: 0 }, options)).toBe("gone");
  });
});

describe("appendGoalSeedLine", () => {
  it("appends keyed lines capped at the pool and custom lines at 0", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-01T00:00:00Z"));
    const draft: GoalProfile = { ...EMPTY_GOAL_PROFILE, id: "goal-new", seedLines: [] };
    const withKeyed = appendGoalSeedLine(draft, "catalog:a1", options, saved)!;
    expect(withKeyed.seedLines).toHaveLength(1);
    expect(withKeyed.seedLines![0].id).toMatch(new RegExp(`^seed-${Date.now()}-[a-z0-9]+$`));
    expect(withKeyed.seedLines![0]).toMatchObject({ sourceKey: "catalog:a1", amount: 0 });

    const withGold = appendGoalSeedLine(draft, "catalog:a2", options, saved)!;
    expect(withGold.seedLines![0]).toMatchObject({ sourceKey: "catalog:a2", amount: 150_000_000 });

    const withCustom = appendGoalSeedLine(withGold, "custom", options, saved)!;
    expect(withCustom.seedLines![1]).toMatchObject({ sourceKey: "custom", amount: 0 });
    // Duplicates of keyed sources are refused; custom may repeat.
    expect(appendGoalSeedLine(withGold, "catalog:a2", options, saved)).toBeNull();
    expect(appendGoalSeedLine(withCustom, "custom", options, saved)).not.toBeNull();
    expect(appendGoalSeedLine(draft, "none", options, saved)).toBeNull();
    expect(appendGoalSeedLine(draft, "", options, saved)).toBeNull();
    expect(appendGoalSeedLine(draft, "catalog:zzz", options, saved)).toBeNull();
  });
});
