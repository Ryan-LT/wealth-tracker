import { describe, expect, it } from "vitest";

import { assetTotalsByCategory } from "@/entities/portfolio";
import { fixtureAssets, fixtureCatalog } from "@/test/fixtures/tables";

describe("assetTotalsByCategory", () => {
  it("merges catalog and legacy holdings, largest first, shares sum to 1", () => {
    const rows = assetTotalsByCategory(fixtureCatalog, fixtureAssets);
    expect(rows.map((r) => [r.category, r.value, r.count])).toEqual([
      ["Real Estate", 3_000_000_000, 1],
      ["Cash", 550_000_000, 3],
      ["Stocks & ETFs", 500_000_000, 1],
      ["Investments", 400_000_000, 1],
      ["Precious Metals", 150_000_000, 1],
    ]);
    expect(rows.reduce((s, r) => s + r.share, 0)).toBeCloseTo(1, 10);
  });
});
