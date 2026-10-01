import { afterEach, describe, expect, it, vi } from "vitest";

import { computeDashboardSummary, computeNetWorth, liquidityBandLabel, liquidityBandTone, summarizeCashflow } from "@/entities/portfolio";
import { fixtureAssets, fixtureCatalog, fixtureDebts, fixtureIncome, fixturePrefs } from "@/test/fixtures/tables";

afterEach(() => vi.useRealTimers());

describe("portfolio summary", () => {
  it("computes net worth and cashflow", () => {
    expect(computeNetWorth({ assets: fixtureAssets, settingsAssets: fixtureCatalog, debts: fixtureDebts })).toBe(4_330_000_000);
    expect(summarizeCashflow(fixturePrefs, fixtureIncome)).toEqual({
      totalIncome: 61_500_000,
      activeIncome: 60_000_000,
      passiveIncome: 1_500_000,
      averageSpending: 25_000_000,
      monthlyNet: 36_500_000,
    });
  });

  it("computes the dashboard summary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-31T12:00:00+07:00"));
    const s = computeDashboardSummary({
      assets: fixtureAssets,
      debts: fixtureDebts,
      settingsAssets: fixtureCatalog,
      incomeSources: fixtureIncome,
      prefs: fixturePrefs,
    });
    expect(s).toMatchObject({
      grossAssets: 4_600_000_000,
      liabilities: 270_000_000,
      netWorth: 4_330_000_000,
      portfolioDetailTotal: 3_650_000_000,
      assetConfigurationTotal: 950_000_000,
      monthlyNet: 36_500_000,
    });
    expect(s.eoyProjection).toBeGreaterThan(4_330_000_000);
    expect(s.eoyProjection).toBeLessThan(4_330_000_000 + 36_500_000);
  });

  it("labels liquidity bands", () => {
    expect(liquidityBandLabel("instant")).toBe("Instant access");
    expect(liquidityBandTone("not_instant")).toBe("warning");
    expect(liquidityBandTone("custom")).toBe("neutral");
  });
});
