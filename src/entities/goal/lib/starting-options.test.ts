import { describe, expect, it } from "vitest";

import { buildGoalStartingOptions } from "@/entities/goal/lib/starting-options";
import { fixtureAssets, fixtureCatalog } from "@/test/fixtures/tables";

describe("buildGoalStartingOptions", () => {
  it("lists none, portfolio, catalog, custom in order", () => {
    expect(buildGoalStartingOptions(fixtureAssets, fixtureCatalog)).toMatchInlineSnapshot(`
      [
        {
          "amount": 0,
          "key": "none",
          "label": "No starting balance (0 ₫)",
        },
        {
          "amount": 3000000000,
          "key": "re:re1",
          "label": "Real estate — Apartment",
          "liquidity": "not_instant",
        },
        {
          "amount": 200000000,
          "key": "cash:c1",
          "label": "Cash — VCB savings",
          "liquidity": "instant",
        },
        {
          "amount": 50000000,
          "key": "cash:c2",
          "label": "Cash — Checking",
          "liquidity": "instant",
        },
        {
          "amount": 400000000,
          "key": "inv:i1",
          "label": "Investment — VN30 ETF",
          "liquidity": "not_instant",
        },
        {
          "amount": 300000000,
          "category": "Cash",
          "key": "catalog:a1",
          "label": "Emergency fund",
          "liquidity": "instant",
        },
        {
          "amount": 150000000,
          "category": "Precious Metals",
          "key": "catalog:a2",
          "label": "Gold bars",
          "liquidity": "not_instant",
        },
        {
          "amount": 500000000,
          "category": "Stocks & ETFs",
          "key": "catalog:a3",
          "label": "Brokerage",
          "liquidity": "instant",
        },
        {
          "amount": -10,
          "category": "Other",
          "key": "catalog:a4",
          "label": "Broken row",
          "liquidity": "instant",
        },
        {
          "amount": 0,
          "isCustom": true,
          "key": "custom",
          "label": "Custom starting balance…",
        },
      ]
    `);
  });
});
