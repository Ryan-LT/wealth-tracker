import { describe, expect, it } from "vitest";

import { moveItem } from "@/shared/lib/array";
import {
  fractionalMonthsBetween,
  localDay,
  parseIsoDay,
  startOfMonth,
  toIsoDay,
  todayIso,
} from "@/shared/lib/date";

describe("date helpers", () => {
  it("parses ISO days at local noon", () => {
    expect(parseIsoDay("2026-03-09")?.toISOString()).toBe("2026-03-09T05:00:00.000Z");
    expect(parseIsoDay("2026-03-09T23:00:00Z")?.toISOString()).toBe("2026-03-09T05:00:00.000Z");
    expect(parseIsoDay("")).toBeNull();
    expect(parseIsoDay("nope")).toBeNull();
    expect(parseIsoDay(undefined)).toBeNull();
  });

  it("formats and truncates local days", () => {
    const d = new Date(2026, 0, 5, 18, 30);
    expect(toIsoDay(d)).toBe("2026-01-05");
    expect(todayIso(d)).toBe("2026-01-05");
    expect(localDay(d).getHours()).toBe(0);
    expect(toIsoDay(startOfMonth(d))).toBe("2026-01-01");
    expect(fractionalMonthsBetween(d, d)).toBe(0);
    expect(fractionalMonthsBetween(new Date(2026, 1, 1), d)).toBe(0);
  });

  it("moves array items immutably", () => {
    const list = ["a", "b", "c", "d"];
    expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(moveItem(list, 3, 0)).toEqual(["d", "a", "b", "c"]);
    expect(moveItem(list, 5, 0)).toEqual(list);
    expect(list).toEqual(["a", "b", "c", "d"]);
  });
});
