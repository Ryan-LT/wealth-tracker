import { describe, expect, it } from "vitest";

import {
  analyzeMilestone35,
  formatAheadOfTarget,
  milestoneChipDetail,
  milestoneHint,
  type MilestoneConfigOk,
  type MilestoneFormatters,
} from "@/entities/milestone";

const fmt: MilestoneFormatters = {
  money: (n, o) => `${o?.signed ? "+" : ""}${n}₫`,
  usd: (n) => `$${n}`,
};
const now = new Date("2026-01-01T00:00:00Z");
const ok: MilestoneConfigOk = {
  ok: true,
  deadlineIso: "2030-01-01T00:00:00.000Z",
  targetUsd: 1_000,
  targetVnd: 10_000,
  vndPerUsd: 10,
  annualRealRate: 0.025,
  realRateSource: "default",
  vndPerUsdSource: "env",
  fxFetchedAtIso: null,
  fxApiLastUpdateIso: null,
};

describe("analyzeMilestone35", () => {
  it("incomplete config", () => {
    const a = analyzeMilestone35({
      config: { ...ok, ok: false, missing: "FX_RATE", targetVnd: null, vndPerUsd: null },
      currentNetWorth: 0,
      monthlyNetContribution: 0,
      now,
    });
    expect(a).toEqual({ kind: "incomplete", targetUsd: 1_000, missing: "FX_RATE" });
    expect(milestoneHint(a, fmt)).toContain("EXCHANGERATE_API_KEY");
  });

  it("achieved", () => {
    const a = analyzeMilestone35({ config: ok, currentNetWorth: 12_500, monthlyNetContribution: 0, now });
    expect(a).toMatchObject({ kind: "achieved", pct: 100, surplus: 2_500, pastDeadline: false });
    expect(milestoneChipDetail(a, 12_500, fmt)).toBe("+25.0% · +2500₫");
    expect(milestoneHint(a, fmt)).toBe("Already +25.0% · +2500₫ above the $1000 target.");
  });

  it("past deadline", () => {
    const a = analyzeMilestone35({
      config: { ...ok, deadlineIso: "2025-01-01T00:00:00.000Z" },
      currentNetWorth: 2_500,
      monthlyNetContribution: 0,
      now,
    });
    expect(a).toMatchObject({ kind: "past_deadline", pct: 25 });
  });

  it("projection tones", () => {
    const onTrack = analyzeMilestone35({ config: ok, currentNetWorth: 1_000, monthlyNetContribution: 1_000, now });
    expect(onTrack).toMatchObject({ kind: "projection", tone: "on_track", label: "On track", feasible: true, pct: 10 });
    expect(milestoneHint(onTrack, fmt)).toMatch(/^Projected \d+(\.\d+)?₫ at age 35 — \+\d/);
    expect(milestoneChipDetail(onTrack, 1_000, fmt)).toMatch(/^\+\d+\.\d% · \+/);

    const tight = analyzeMilestone35({
      config: { ...ok, deadlineIso: "2026-01-20T00:00:00.000Z" },
      currentNetWorth: 9_990,
      monthlyNetContribution: 100,
      now,
    });
    expect(tight).toMatchObject({ kind: "projection", tone: "steady", label: "Tight but possible" });

    const behind = analyzeMilestone35({ config: ok, currentNetWorth: 0, monthlyNetContribution: 10, now });
    expect(behind).toMatchObject({ kind: "projection", tone: "at_risk", label: "Below projection", feasible: false });
    expect(milestoneHint(behind, fmt)).toMatch(/^Trajectory lands near .* below target\.$/);
    expect(milestoneChipDetail(behind, 0, fmt)).toBeUndefined();
  });

  it("formats ahead-of-target labels", () => {
    expect(formatAheadOfTarget(90, 100, fmt)).toEqual({ surplus: -10, pctLabel: "-10.0%", moneyLabel: "10₫", detail: "-10.0% · 10₫" });
  });
});
