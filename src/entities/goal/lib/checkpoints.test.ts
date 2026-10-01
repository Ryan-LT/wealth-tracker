import { describe, expect, it, vi } from "vitest";

import {
  cumulativeDueScheduleFromCheckpoints,
  normalizeStoredCheckpoints,
} from "@/entities/goal/lib/checkpoints";

describe("normalizeStoredCheckpoints", () => {
  it("cleans, floors, sorts and keeps paid only when true", () => {
    expect(
      normalizeStoredCheckpoints([
        { id: " b ", date: "2027-01-01T00:00:00Z", amount: 10.9, paid: false },
        { id: "a", date: "2026-06-01", amount: -5, paid: true },
        { id: "", date: "2026-01-01", amount: 1 },
        { id: "c", date: " ", amount: 1 },
        null as unknown as never,
      ]),
    ).toEqual([
      { id: "a", date: "2026-06-01", amount: 0, paid: true },
      { id: "b", date: "2027-01-01", amount: 10 },
    ]);
    expect(normalizeStoredCheckpoints(undefined)).toEqual([]);
  });

  it("migrates legacy cumulative amounts to installments", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const legacy = [
      { id: "1", date: "2026-01-01", cumulativeAmount: 100 },
      { id: "3", date: "2026-03-01", cumulativeAmount: 250, paid: true },
      { id: "2", date: "2026-02-01", cumulativeAmount: 300 },
    ] as unknown as Parameters<typeof normalizeStoredCheckpoints>[0];
    expect(normalizeStoredCheckpoints(legacy)).toEqual([
      { id: "1", date: "2026-01-01", amount: 100 },
      { id: "2", date: "2026-02-01", amount: 200 },
      { id: "3", date: "2026-03-01", amount: 0, paid: true },
    ]);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe("cumulativeDueScheduleFromCheckpoints", () => {
  it("sums same-day installments then accumulates", () => {
    const rows = cumulativeDueScheduleFromCheckpoints([
      { id: "1", date: "2026-02-01", amount: 50 },
      { id: "2", date: "2026-01-01", amount: 10 },
      { id: "3", date: "2026-02-01", amount: 5.7 },
      { id: "4", date: "bad", amount: 1 },
    ]);
    expect(rows.map((r) => [r.date.toISOString(), r.cumulative])).toEqual([
      ["2026-01-01T05:00:00.000Z", 10],
      ["2026-02-01T05:00:00.000Z", 65],
    ]);
  });
});
