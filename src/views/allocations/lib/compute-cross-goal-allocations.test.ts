import { describe, expect, it } from "vitest";

import { buildGoalStartingOptions } from "@/entities/goal";
import {
  buildAllocationReport,
  liquidityBandForSourceKey,
  normalizeProfilesForAllocationReport,
} from "@/views/allocations/lib/compute-cross-goal-allocations";
import {
  fixtureAssets,
  fixtureCatalog,
  fixtureIncome,
  planCar,
  planHouse,
  planLegacy,
} from "@/test/fixtures/tables";

const options = buildGoalStartingOptions(fixtureAssets, fixtureCatalog);
const keys = new Set(options.map((o) => o.key));

describe("liquidityBandForSourceKey", () => {
  it("maps key prefixes and catalog liquidity", () => {
    expect(liquidityBandForSourceKey("custom", fixtureCatalog)).toBe("custom");
    expect(liquidityBandForSourceKey("none", fixtureCatalog)).toBe("instant");
    expect(liquidityBandForSourceKey("cash:c1", fixtureCatalog)).toBe("instant");
    expect(liquidityBandForSourceKey("re:re1", fixtureCatalog)).toBe("not_instant");
    expect(liquidityBandForSourceKey("inv:i1", fixtureCatalog)).toBe("not_instant");
    expect(liquidityBandForSourceKey("catalog:a2", fixtureCatalog)).toBe("not_instant");
    expect(liquidityBandForSourceKey("catalog:a3", fixtureCatalog)).toBe("instant");
    expect(liquidityBandForSourceKey("catalog:missing", fixtureCatalog)).toBe("instant");
    expect(liquidityBandForSourceKey("weird", fixtureCatalog)).toBe("not_instant");
  });
});

describe("buildAllocationReport", () => {
  it("normalizes profiles (drops id-less, migrates legacy seeds)", () => {
    const normalized = normalizeProfilesForAllocationReport(
      [planHouse, planCar, planLegacy, { ...planLegacy, id: "" }],
      keys,
    );
    expect(normalized.map((p) => p.id)).toEqual(["goal-1", "goal-2", "goal-3"]);
    expect(normalized[2].seedLines).toEqual([{ id: "migrated-seed", sourceKey: "cash:c1", amount: 0 }]);
  });

  it("reports plans, sources and pools", () => {
    const report = buildAllocationReport(
      normalizeProfilesForAllocationReport([planHouse, planCar], keys),
      options,
      fixtureCatalog,
      fixtureIncome,
    );
    expect(report).toMatchInlineSnapshot(`
      {
        "plans": [
          {
            "effectiveStartingTotal": 610000000,
            "id": "goal-1",
            "name": "House",
            "usesMonthlyIncome": true,
          },
          {
            "effectiveStartingTotal": 50000000,
            "id": "goal-2",
            "name": "Untitled plan",
            "usesMonthlyIncome": false,
          },
        ],
        "sources": [
          {
            "band": "instant",
            "label": "Brokerage",
            "liveBalance": 500000000,
            "perPlanStored": {
              "goal-1": 500000000,
            },
            "remainingPool": 0,
            "sourceKey": "catalog:a3",
            "totalIncomeCapital": 0,
            "totalReservedStored": 500000000,
          },
          {
            "band": "instant",
            "label": "Cash — Checking",
            "liveBalance": 50000000,
            "perPlanStored": {},
            "remainingPool": 50000000,
            "sourceKey": "cash:c2",
            "totalIncomeCapital": 0,
            "totalReservedStored": 0,
          },
          {
            "band": "instant",
            "label": "Cash — VCB savings",
            "liveBalance": 200000000,
            "perPlanStored": {},
            "remainingPool": 200000000,
            "sourceKey": "cash:c1",
            "totalIncomeCapital": 0,
            "totalReservedStored": 0,
          },
          {
            "band": "custom",
            "label": "Custom starting balance…",
            "liveBalance": 0,
            "perPlanStored": {
              "goal-1": 10000000,
            },
            "remainingPool": 0,
            "sourceKey": "custom",
            "totalIncomeCapital": 0,
            "totalReservedStored": 10000000,
          },
          {
            "band": "instant",
            "label": "Emergency fund",
            "liveBalance": 300000000,
            "perPlanStored": {
              "goal-1": 250000000,
              "goal-2": 200000000,
            },
            "remainingPool": 0,
            "sourceKey": "catalog:a1",
            "totalIncomeCapital": 100000000,
            "totalReservedStored": 450000000,
          },
          {
            "band": "not_instant",
            "label": "Gold bars",
            "liveBalance": 150000000,
            "perPlanStored": {},
            "remainingPool": 150000000,
            "sourceKey": "catalog:a2",
            "totalIncomeCapital": 0,
            "totalReservedStored": 0,
          },
          {
            "band": "not_instant",
            "label": "Investment — VN30 ETF",
            "liveBalance": 400000000,
            "perPlanStored": {},
            "remainingPool": 400000000,
            "sourceKey": "inv:i1",
            "totalIncomeCapital": 0,
            "totalReservedStored": 0,
          },
          {
            "band": "not_instant",
            "label": "Real estate — Apartment",
            "liveBalance": 3000000000,
            "perPlanStored": {},
            "remainingPool": 3000000000,
            "sourceKey": "re:re1",
            "totalIncomeCapital": 0,
            "totalReservedStored": 0,
          },
        ],
        "totalIncomeCapital": 100000000,
        "totals": {
          "customReservedStored": 10000000,
          "instantRemainingPool": 250000000,
          "notInstantRemainingPool": 3550000000,
        },
      }
    `);
  });
});
