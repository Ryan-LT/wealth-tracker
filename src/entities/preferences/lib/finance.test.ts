import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildNetWorthChartSeries,
  buildNetWorthTrend,
  netWorthTrackingUnchanged,
  estimatedMonthlyNetCashflow,
  fractionalMonthsUntilYearEnd,
  monthCalendarKey,
  monthToDateNetWorthChangePercent,
  projectNetWorthEndOfYear,
  resolveAverageMonthlySpending,
  syncNetWorthTracking,
} from "@/entities/preferences/lib/finance";
import { PREFERENCES_SEED } from "@/entities/preferences/model";

afterEach(() => {
  vi.useRealTimers();
});

describe("spending + cashflow", () => {
  it("resolves average spending with legacy fallback", () => {
    expect(resolveAverageMonthlySpending({ averageMonthlySpending: 10, monthOutflow: 99 })).toBe(10);
    expect(resolveAverageMonthlySpending({ monthOutflow: 99 })).toBe(99);
    expect(resolveAverageMonthlySpending({ averageMonthlySpending: -5, monthOutflow: 0 })).toBe(0);
    expect(resolveAverageMonthlySpending({ averageMonthlySpending: Number.NaN, monthOutflow: 0 })).toBe(0);
  });

  it("estimatedMonthlyNetCashflow branch order", () => {
    // Legacy inflow/outflow wins only when settings spending is unset.
    expect(
      estimatedMonthlyNetCashflow({ monthInflow: 100, monthOutflow: 30, netMonthIncome: 7 }, 1_000),
    ).toBe(70);
    // Settings spending set → falls through to netMonthIncome.
    expect(
      estimatedMonthlyNetCashflow(
        { monthInflow: 100, monthOutflow: 30, netMonthIncome: 7, averageMonthlySpending: 5 },
        1_000,
      ),
    ).toBe(7);
    // Default path: income − spending.
    expect(
      estimatedMonthlyNetCashflow(
        { monthInflow: 0, monthOutflow: 0, netMonthIncome: 0, averageMonthlySpending: 250 },
        1_000,
      ),
    ).toBe(750);
    expect(estimatedMonthlyNetCashflow(PREFERENCES_SEED, 0)).toBe(0);
  });

  it("projects net worth linearly to year end", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-01T00:00:00+07:00"));
    const months = fractionalMonthsUntilYearEnd();
    expect(months).toBeCloseTo(6.0452, 3);
    expect(
      projectNetWorthEndOfYear(
        1_000,
        { monthInflow: 0, monthOutflow: 0, netMonthIncome: 0, averageMonthlySpending: 0 },
        10,
      ),
    ).toBeCloseTo(1_000 + 10 * months, 6);
  });
});

describe("net worth tracking", () => {
  it("month keys and MTD percent", () => {
    expect(monthCalendarKey(new Date(2026, 0, 31))).toBe("2026-01");
    expect(monthToDateNetWorthChangePercent({ netWorthMonthBaseline: 200 }, 250)).toBe(25);
    expect(monthToDateNetWorthChangePercent({ netWorthMonthBaseline: -200 }, -100)).toBe(50);
    expect(monthToDateNetWorthChangePercent({ netWorthMonthBaseline: 0.5 }, 250)).toBe(0);
    expect(monthToDateNetWorthChangePercent({}, 250)).toBe(0);
  });

  it("first visit sets baseline to current net worth", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T10:00:00+07:00"));
    expect(syncNetWorthTracking(PREFERENCES_SEED, 500)).toEqual({
      ...PREFERENCES_SEED,
      netWorthMonthKey: "2026-03",
      netWorthMonthBaseline: 500,
      lastKnownNetWorth: 500,
      netWorthMonthlyHistory: [{ monthKey: "2026-03", value: 500 }],
    });
  });

  it("same month keeps baseline; month rollover uses last known", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T10:00:00+07:00"));
    const prev = {
      ...PREFERENCES_SEED,
      netWorthMonthKey: "2026-03",
      netWorthMonthBaseline: 400,
      lastKnownNetWorth: 450,
      netWorthMonthlyHistory: [{ monthKey: "2026-03", value: 450 }],
    };
    expect(syncNetWorthTracking(prev, 600)).toMatchObject({
      netWorthMonthBaseline: 400,
      lastKnownNetWorth: 600,
      netWorthMonthlyHistory: [{ monthKey: "2026-03", value: 600 }],
    });

    vi.setSystemTime(new Date("2026-04-02T10:00:00+07:00"));
    expect(syncNetWorthTracking(prev, 700)).toMatchObject({
      netWorthMonthKey: "2026-04",
      netWorthMonthBaseline: 450,
      lastKnownNetWorth: 700,
      netWorthMonthlyHistory: [
        { monthKey: "2026-03", value: 450 },
        { monthKey: "2026-04", value: 700 },
      ],
    });
  });

  it("keeps only the last six months of history", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-15T10:00:00+07:00"));
    const history = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07"].map(
      (monthKey, i) => ({ monthKey, value: i }),
    );
    const next = syncNetWorthTracking({ ...PREFERENCES_SEED, netWorthMonthlyHistory: history }, 99);
    expect(next.netWorthMonthlyHistory!.map((h) => h.monthKey)).toEqual([
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
    ]);
  });

  it("buildNetWorthChartSeries carries values forward and uses live current month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T10:00:00+07:00"));
    const series = buildNetWorthChartSeries(
      [
        { monthKey: "2026-02", value: 100 },
        { monthKey: "2026-04", value: 300 },
        { monthKey: "2026-06", value: 999 },
      ],
      500,
    );
    expect(series.values).toEqual([100, 100, 100, 300, 300, 500]);
    expect(series.labels).toHaveLength(6);
  });
});

describe("buildNetWorthTrend", () => {
  it("matches the chart series values and labels each month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T10:00:00+07:00"));
    const history = [
      { monthKey: "2026-02", value: 100 },
      { monthKey: "2026-04", value: 300 },
    ];
    const trend = buildNetWorthTrend(history, 500);
    expect(trend.map((p) => p.value)).toEqual(buildNetWorthChartSeries(history, 500).values);
    expect(trend.map((p) => p.monthKey)).toEqual(["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"]);
    expect(trend.at(-1)!.live).toBe(true);
    expect(trend.filter((p) => p.live)).toHaveLength(1);
  });

  it("detects unchanged tracking", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T10:00:00+07:00"));
    const once = syncNetWorthTracking(PREFERENCES_SEED, 500);
    expect(netWorthTrackingUnchanged(once, syncNetWorthTracking(once, 500))).toBe(true);
    expect(netWorthTrackingUnchanged(once, syncNetWorthTracking(once, 501))).toBe(false);
  });
});
