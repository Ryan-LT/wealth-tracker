import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatMoney,
  formatMoneyCompact,
  formatMonths,
  formatNumber,
  formatOrdinal,
  formatPercent,
  formatUsd,
  formatUsdCompact,
} from "@/shared/lib/format";

describe("money", () => {
  it("formats full VND with dots and trailing symbol", () => {
    expect(formatMoney(1_245_670_000)).toBe("1.245.670.000 ₫");
    expect(formatMoney(0)).toBe("0 ₫");
    expect(formatMoney(-25_000)).toBe("−25.000 ₫");
    expect(formatMoney(1_000, { signDisplay: "always" })).toBe("+1.000 ₫");
    expect(formatMoney(0, { signDisplay: "exceptZero" })).toBe("0 ₫");
    expect(formatMoney(1_000.6)).toBe("1.001 ₫");
    expect(formatMoney(999, { symbol: false })).toBe("999");
    expect(formatMoney(Number.NaN)).toBe("— ₫");
  });

  it("formats compact VND with 3 significant digits", () => {
    expect(formatMoneyCompact(4_823_000_000)).toBe("4,82B ₫");
    expect(formatMoneyCompact(32_510_000)).toBe("32,5M ₫");
    expect(formatMoneyCompact(850_000)).toBe("850K ₫");
    expect(formatMoneyCompact(1_000_000)).toBe("1M ₫");
    expect(formatMoneyCompact(999)).toBe("999 ₫");
    expect(formatMoneyCompact(999_950_000)).toBe("1B ₫");
    expect(formatMoneyCompact(-12_345_678)).toBe("−12,3M ₫");
    expect(formatMoneyCompact(2_500_000, { signDisplay: "always" })).toBe("+2,5M ₫");
    expect(formatMoneyCompact(1_234_000_000_000)).toBe("1,23T ₫");
    expect(formatMoneyCompact(0.3)).toBe("0 ₫");
    expect(formatMoneyCompact(4_000_000_000, { symbol: false })).toBe("4B");
  });

  it("formats USD", () => {
    expect(formatUsd(1_000_000)).toBe("$1,000,000");
    expect(formatUsd(-5)).toBe("−$5");
    expect(formatUsdCompact(1_000_000)).toBe("$1M");
  });
});

describe("numbers", () => {
  it("groups and uses comma decimals", () => {
    expect(formatNumber(1_245_670.56, { maximumFractionDigits: 2 })).toBe("1.245.670,56");
    expect(formatNumber(9.5, { maximumFractionDigits: 3 })).toBe("9,5");
    expect(formatNumber(-3)).toBe("−3");
    expect(formatNumber(-0.0001, { maximumFractionDigits: 2 })).toBe("0");
    expect(formatPercent(12.345)).toBe("12,3%");
    expect(formatPercent(2.5, { signDisplay: "exceptZero" })).toBe("+2,5%");
    expect(formatPercent(9.125, { maximumFractionDigits: 3 })).toBe("9,125%");
    expect(formatOrdinal(1)).toBe("1st");
    expect(formatOrdinal(12)).toBe("12th");
    expect(formatOrdinal(22)).toBe("22nd");
    expect(formatMonths(4.24)).toBe("4,2 mo");
  });
});

describe("dates", () => {
  it("formats ISO days and Dates", () => {
    expect(formatDate("2026-03-12")).toBe("12 Mar 2026");
    expect(formatDate("2026-03-12", "monthYear")).toBe("Mar 2026");
    expect(formatDate(new Date(2026, 0, 5), "dayMonth")).toBe("5 Jan");
    expect(formatDate("")).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("bad")).toBe("bad");
  });
});
