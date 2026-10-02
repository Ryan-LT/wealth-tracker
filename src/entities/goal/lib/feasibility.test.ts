import { describe, expect, it } from "vitest";

import { computeGoalFeasibility } from "@/entities/goal/lib/feasibility";

const now = new Date("2026-01-01T12:00:00+07:00");

function tone(input: Partial<Parameters<typeof computeGoalFeasibility>[0]>) {
  const r = computeGoalFeasibility({
    saved: 0,
    targetAmount: 1_200,
    estimatedMonthlyNet: 0,
    now,
    ...input,
  });
  return `${r.tone}:${r.label}`;
}

describe("computeGoalFeasibility", () => {
  it("covers target / achieved / no-date branches", () => {
    expect(tone({ targetAmount: 0 })).toBe("unknown:Set a target");
    expect(tone({ targetAmount: Number.NaN })).toBe("unknown:Set a target");
    expect(tone({ saved: 1_200 })).toBe("achieved:Target met");
    expect(tone({ saved: 1_100 })).toBe("on_track:Closing in");
    expect(tone({ saved: 600 })).toBe("steady:Building");
    expect(tone({ saved: 300 })).toBe("watch:Early stretch");
    expect(tone({ saved: 100 })).toBe("steady:Just started");
  });

  it("covers income-included pace branches", () => {
    // 12 months left, 1,200 remaining → 100 / month needed.
    const base = { targetDateIso: "2027-01-01" };
    expect(tone({ ...base, targetDateIso: "2025-06-01" })).toBe("at_risk:Past deadline");
    expect(tone({ ...base, estimatedMonthlyNet: 0 })).toBe("at_risk:Budget squeeze");
    expect(tone({ ...base, estimatedMonthlyNet: 120 })).toBe("on_track:On track");
    expect(tone({ ...base, estimatedMonthlyNet: 100 })).toBe("steady:Feasible");
    expect(tone({ ...base, estimatedMonthlyNet: 80 })).toBe("watch:Watch pace");
    expect(tone({ ...base, estimatedMonthlyNet: 50 })).toBe("tight:Tight runway");
    expect(tone({ ...base, estimatedMonthlyNet: 10 })).toBe("at_risk:Off pace");
  });

  it("covers allocations-only branches", () => {
    const off = { includeMonthlyIncome: false };
    expect(tone({ ...off, targetDateIso: "2026-01-05", saved: 100 })).toBe("at_risk:Final sprint");
    expect(tone({ ...off, targetDateIso: "2026-03-01", saved: 100 })).toBe("tight:Calendar heat");
    expect(tone({ ...off, targetDateIso: "2026-05-01", saved: 400 })).toBe("watch:Check timing");
    expect(tone({ ...off, targetDateIso: "2028-01-01", saved: 1_000 })).toBe("on_track:In range");
    expect(tone({ ...off, targetDateIso: "2030-01-01", saved: 100 })).toBe("steady:Steady");
  });

  it("returns hints", () => {
    expect(
      computeGoalFeasibility({ saved: 0, targetAmount: 1, estimatedMonthlyNet: 0, now, targetDateIso: "2027-01-01" }),
    ).toMatchInlineSnapshot(`
      {
        "hint": "This plan gets no positive monthly savings while it still has a gap.",
        "label": "Budget squeeze",
        "tone": "at_risk",
      }
    `);
  });
});
