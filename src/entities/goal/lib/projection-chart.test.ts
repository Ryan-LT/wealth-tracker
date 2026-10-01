import { describe, expect, it } from "vitest";

import {
  buildAxisColumnDates,
  buildProjectionChartModel,
  computeProjectedMeetTarget,
  paidCheckpointDots,
} from "@/entities/goal/lib/projection-chart";
import { toIsoDay } from "@/shared/lib/date";

const today = new Date(2026, 0, 15);
const days = (ds: Date[]) => ds.map(toIsoDay);

describe("computeProjectedMeetTarget", () => {
  it("handles none / already / unreachable / date", () => {
    expect(computeProjectedMeetTarget(today, 0, 10, 0)).toEqual({ kind: "none" });
    expect(computeProjectedMeetTarget(today, 10, 0, 10).kind).toBe("already");
    expect(computeProjectedMeetTarget(today, 0, 0, 10)).toEqual({ kind: "unreachable" });
    const m = computeProjectedMeetTarget(today, 0, 10, 30);
    expect(m.kind).toBe("date");
    if (m.kind === "date") {
      expect(m.months).toBe(3);
      expect(toIsoDay(m.date)).toBe("2026-04-16");
    }
  });
});

describe("buildAxisColumnDates", () => {
  it("month starts through the goal plus goal and in-range checkpoint days", () => {
    expect(
      days(
        buildAxisColumnDates(
          today,
          "2026-04-10",
          [
            { id: "a", date: "2026-02-20", amount: 1 },
            { id: "b", date: "2025-12-01", amount: 1 },
            { id: "c", date: "2026-09-01", amount: 1 },
            { id: "d", date: "", amount: 1 },
          ],
          3,
        ),
      ),
    ).toEqual(["2026-01-01", "2026-02-01", "2026-02-20", "2026-03-01", "2026-04-01", "2026-04-10"]);
  });

  it("uses monthsToTarget without a goal date", () => {
    expect(days(buildAxisColumnDates(today, undefined, [{ id: "a", date: "2026-07-07", amount: 1 }], 2))).toEqual([
      "2026-01-01",
      "2026-02-01",
      "2026-03-01",
      "2026-07-07",
    ]);
  });
});

describe("paidCheckpointDots", () => {
  it("plots paid rows at the running total", () => {
    const dots = paidCheckpointDots([
      { id: "b", date: "2026-03-01", amount: 20, paid: true },
      { id: "a", date: "2026-02-01", amount: 10.8 },
    ]);
    expect(dots).toEqual([{ id: "b", x: new Date(2026, 2, 1).getTime(), cumulative: 30 }]);
  });
});

describe("buildProjectionChartModel", () => {
  it("extends the axis to the meet date and flags after-goal", () => {
    const model = buildProjectionChartModel({
      today,
      targetAmount: 100,
      startingAmount: 0,
      monthlyNetContribution: 20,
      monthsToTarget: 2,
      targetDateIso: "2026-03-01",
      checkpoints: [{ id: "a", date: "2026-02-01", amount: 40, paid: true }],
    });
    expect(model.meetTarget.kind).toBe("date");
    expect(model.afterGoalDate).toBe(true);
    expect(model.goalDate && toIsoDay(model.goalDate)).toBe("2026-03-01");
    expect(model.hasSchedule).toBe(true);
    expect(model.rows.map((r) => toIsoDay(new Date(r.x)))).toEqual([
      "2026-01-01",
      "2026-02-01",
      "2026-03-01",
      "2026-04-01",
      "2026-05-01",
      "2026-06-01",
      "2026-06-16",
    ]);
    expect(model.rows[0]).toEqual({ x: new Date(2026, 0, 1).getTime(), projected: 0, due: 0, target: 100 });
    expect(model.rows[1].due).toBe(40);
    expect(model.rows.at(-1)!.projected).toBeCloseTo(100, 0);
    expect(model.paidDots).toHaveLength(1);
  });

  it("has no schedule without checkpoints", () => {
    const model = buildProjectionChartModel({
      today,
      targetAmount: 100,
      startingAmount: 200,
      monthlyNetContribution: 0,
      monthsToTarget: 1,
      checkpoints: [],
    });
    expect(model.hasSchedule).toBe(false);
    expect(model.rows.every((r) => r.due === null)).toBe(true);
    expect(model.meetTarget.kind).toBe("already");
    expect(model.afterGoalDate).toBe(false);
  });
});
