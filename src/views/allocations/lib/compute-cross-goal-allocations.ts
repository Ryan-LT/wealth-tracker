import type { GoalStartingOption } from "@/shared/lib";
import {
  liveBalanceForSourceKey,
  maxAllocationForSourceKey,
  totalGoalStartingBalance,
} from "@/shared/lib";
import {
  EMPTY_GOAL_PROFILE,
  type GoalProfile,
  resolveSettingsAssetLiquidity,
  type SettingsAsset,
} from "@/shared/storage";

/** Draft used only to compute shared pools (id must not match any saved plan). */
export const PHANTOM_ALLOCATION_DRAFT: GoalProfile = {
  ...EMPTY_GOAL_PROFILE,
  id: "__phantom_allocations__",
  name: "",
};

export type LiquidityBand = "instant" | "not_instant" | "custom";

export function liquidityBandForSourceKey(
  sourceKey: string,
  catalog: SettingsAsset[],
): LiquidityBand {
  if (sourceKey === "custom") return "custom";
  if (sourceKey === "none") return "instant";
  if (sourceKey.startsWith("cash:")) return "instant";
  if (sourceKey.startsWith("re:") || sourceKey.startsWith("inv:")) return "not_instant";
  if (sourceKey.startsWith("catalog:")) {
    const id = sourceKey.slice("catalog:".length);
    const row = catalog.find((a) => a.id === id);
    return resolveSettingsAssetLiquidity(row?.liquidity) === "instant"
      ? "instant"
      : "not_instant";
  }
  return "not_instant";
}

export type AllocationPlanColumn = {
  id: string;
  name: string;
  usesMonthlyIncome: boolean;
  /** Sum of effective (capped) starting lines for this plan. */
  effectiveStartingTotal: number;
};

export type AllocationSourceRow = {
  sourceKey: string;
  label: string;
  band: LiquidityBand;
  liveBalance: number;
  /** Raw amounts saved on plans (may exceed live until Goal Plan clamps). */
  totalReservedStored: number;
  /** How much more keyed capacity exists before hitting live minus others’ claims. */
  remainingPool: number;
  perPlanStored: Record<string, number>;
};

export type AllocationReport = {
  plans: AllocationPlanColumn[];
  sources: AllocationSourceRow[];
  totals: {
    instantRemainingPool: number;
    notInstantRemainingPool: number;
    customReservedStored: number;
  };
};

function storedForPlan(plan: GoalProfile, sourceKey: string): number {
  return (plan.seedLines ?? [])
    .filter((l) => l.sourceKey === sourceKey)
    .reduce((s, l) => s + Math.max(0, l.amount), 0);
}

function labelForKey(sourceKey: string, seedOptions: GoalStartingOption[]): string {
  return seedOptions.find((o) => o.key === sourceKey)?.label ?? sourceKey;
}

export function buildAllocationReport(
  profiles: GoalProfile[],
  seedOptions: GoalStartingOption[],
  catalog: SettingsAsset[],
): AllocationReport {
  const saved = profiles.filter((p) => p.id);
  const phantom = PHANTOM_ALLOCATION_DRAFT;

  const plans: AllocationPlanColumn[] = saved.map((p) => ({
    id: p.id,
    name: p.name.trim() || "Untitled plan",
    usesMonthlyIncome: p.includeMonthlyIncome !== false,
    effectiveStartingTotal: totalGoalStartingBalance(
      p.seedLines,
      seedOptions,
      saved,
      p,
    ),
  }));

  const keySet = new Set<string>();
  for (const o of seedOptions) {
    if (o.key !== "none") keySet.add(o.key);
  }
  for (const p of saved) {
    for (const l of p.seedLines ?? []) {
      keySet.add(l.sourceKey);
    }
  }
  keySet.delete("none");

  const keysSorted = [...keySet].sort((a, b) =>
    labelForKey(a, seedOptions).localeCompare(labelForKey(b, seedOptions)),
  );

  const sources: AllocationSourceRow[] = [];
  for (const sourceKey of keysSorted) {
    const label = labelForKey(sourceKey, seedOptions);
    const band = liquidityBandForSourceKey(sourceKey, catalog);
    const liveBalance = liveBalanceForSourceKey(sourceKey, seedOptions);
    const remainingPool = maxAllocationForSourceKey(
      sourceKey,
      seedOptions,
      saved,
      phantom,
      undefined,
    );

    const perPlanStored: Record<string, number> = {};
    let totalReservedStored = 0;
    for (const p of saved) {
      const v = storedForPlan(p, sourceKey);
      if (v > 0) perPlanStored[p.id] = v;
      totalReservedStored += v;
    }

    if (liveBalance <= 0 && totalReservedStored <= 0) continue;

    sources.push({
      sourceKey,
      label,
      band,
      liveBalance,
      totalReservedStored,
      remainingPool,
      perPlanStored,
    });
  }

  let instantRemainingPool = 0;
  let notInstantRemainingPool = 0;
  for (const r of sources) {
    if (r.band === "instant") instantRemainingPool += r.remainingPool;
    else if (r.band === "not_instant") notInstantRemainingPool += r.remainingPool;
  }

  const customReservedStored = saved.reduce(
    (s, p) =>
      s +
      (p.seedLines ?? [])
        .filter((l) => l.sourceKey === "custom")
        .reduce((acc, l) => acc + Math.max(0, l.amount), 0),
    0,
  );

  return {
    plans,
    sources,
    totals: {
      instantRemainingPool,
      notInstantRemainingPool,
      customReservedStored,
    },
  };
}
