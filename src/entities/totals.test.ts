import { describe, expect, it } from "vitest";

import { totalAssetValue } from "@/entities/asset";
import { totalDebtBalance } from "@/entities/debt";
import { monthlyIncomeByKind, totalCapitalAmount, totalMonthlyIncomeFromSources, wrapIncomeSourceAsProfile } from "@/entities/income";
import { totalSettingsAssetsValue } from "@/entities/settings-asset";
import { totalCombinedAssetValue } from "@/entities/portfolio";
import { fixtureAssets, fixtureCatalog, fixtureDebts, fixtureIncome } from "@/test/fixtures/tables";

describe("entity totals", () => {
  it("sums each document", () => {
    expect(totalAssetValue(fixtureAssets)).toBe(3_650_000_000);
    expect(totalSettingsAssetsValue(fixtureCatalog)).toBe(950_000_000);
    expect(totalCombinedAssetValue(fixtureAssets, fixtureCatalog)).toBe(4_600_000_000);
    expect(totalDebtBalance(fixtureDebts)).toBe(270_000_000);
    expect(totalMonthlyIncomeFromSources(fixtureIncome)).toBe(61_500_000);
    expect(monthlyIncomeByKind(fixtureIncome, "active")).toBe(60_000_000);
    expect(monthlyIncomeByKind(fixtureIncome, "passive")).toBe(1_500_000);
    expect(totalCapitalAmount([{ amount: 5 }, { amount: -2 }])).toBe(5);
    expect(totalCapitalAmount(undefined)).toBe(0);
  });

  it("wraps an income source as a goal profile", () => {
    expect(wrapIncomeSourceAsProfile(fixtureIncome[1])).toEqual({
      id: "income:inc2",
      name: "Deposit interest",
      targetAmount: 0,
      targetDate: "",
      monthlyContribution: 0,
      seedLines: [{ id: "cl1", sourceKey: "catalog:a1", amount: 100_000_000 }],
      checkpoints: [],
      includeMonthlyIncome: true,
    });
    expect(wrapIncomeSourceAsProfile({ ...fixtureIncome[0], name: " " }).name).toBe("Income source");
  });
});
