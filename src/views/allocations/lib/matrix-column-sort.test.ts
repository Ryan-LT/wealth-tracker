import { describe, expect, it } from "vitest";

import type { AllocationSourceRow } from "@/entities/portfolio";
import {
  cycleMatrixColumnSort,
  normalizeMatrixColumnSort,
  sortIndicator,
  sortMatrixByColumn,
} from "@/views/allocations/lib/matrix-column-sort";

function row(label: string, band: AllocationSourceRow["band"], n: number, plan = 0): AllocationSourceRow {
  return {
    sourceKey: label,
    label,
    band,
    liveBalance: n,
    totalReservedStored: n * 2,
    remainingPool: 100 - n,
    perPlanStored: plan ? { p1: plan } : {},
    totalIncomeCapital: 0,
  };
}

const rows = [row("beta", "not_instant", 3, 5), row("Alpha", "not_instant", 1), row("gamma", "instant", 2, 9), row("delta", "custom", 3)];
const labels = (r: AllocationSourceRow[]) => r.map((x) => x.label);

describe("cycleMatrixColumnSort", () => {
  it("source starts asc; numeric columns start desc; third click clears", () => {
    const a = cycleMatrixColumnSort(null, { type: "source" });
    expect(a).toEqual({ kind: "source", dir: "asc" });
    const b = cycleMatrixColumnSort(a, { type: "source" });
    expect(b).toEqual({ kind: "source", dir: "desc" });
    expect(cycleMatrixColumnSort(b, { type: "source" })).toBeNull();

    const p = cycleMatrixColumnSort(b, { type: "plan", planId: "p1" });
    expect(p).toEqual({ kind: "plan", planId: "p1", dir: "desc" });
    expect(cycleMatrixColumnSort(p, { type: "plan", planId: "p2" })).toEqual({ kind: "plan", planId: "p2", dir: "desc" });
    expect(cycleMatrixColumnSort(p, { type: "plan", planId: "p1" })).toEqual({ kind: "plan", planId: "p1", dir: "asc" });
    expect(cycleMatrixColumnSort({ kind: "live", dir: "asc" }, { type: "live" })).toBeNull();
  });
});

describe("sortMatrixByColumn", () => {
  it("default: instant first then label (case-insensitive)", () => {
    expect(labels(sortMatrixByColumn(rows, null))).toEqual(["gamma", "Alpha", "beta", "delta"]);
  });
  it("by column with label tie-break", () => {
    expect(labels(sortMatrixByColumn(rows, { kind: "source", dir: "desc" }))).toEqual(["gamma", "delta", "beta", "Alpha"]);
    expect(labels(sortMatrixByColumn(rows, { kind: "live", dir: "desc" }))).toEqual(["beta", "delta", "gamma", "Alpha"]);
    expect(labels(sortMatrixByColumn(rows, { kind: "reserved", dir: "asc" }))).toEqual(["Alpha", "gamma", "beta", "delta"]);
    expect(labels(sortMatrixByColumn(rows, { kind: "pool", dir: "asc" }))).toEqual(["beta", "delta", "gamma", "Alpha"]);
    expect(labels(sortMatrixByColumn(rows, { kind: "plan", planId: "p1", dir: "desc" }))).toEqual(["gamma", "beta", "Alpha", "delta"]);
  });
});

describe("normalizeMatrixColumnSort / sortIndicator", () => {
  it("validates persisted values", () => {
    expect(normalizeMatrixColumnSort(null)).toBeNull();
    expect(normalizeMatrixColumnSort({ kind: "live", dir: "up" })).toBeNull();
    expect(normalizeMatrixColumnSort({ kind: "pool", dir: "asc", extra: 1 })).toEqual({ kind: "pool", dir: "asc" });
    expect(normalizeMatrixColumnSort({ kind: "plan", dir: "desc" })).toBeNull();
    expect(normalizeMatrixColumnSort({ kind: "plan", planId: "x", dir: "desc" })).toEqual({ kind: "plan", planId: "x", dir: "desc" });
    expect(sortIndicator({ kind: "plan", planId: "x", dir: "desc" }, { type: "plan", planId: "x" })).toBe("desc");
    expect(sortIndicator({ kind: "plan", planId: "x", dir: "desc" }, { type: "plan", planId: "y" })).toBeNull();
  });
});
