import type { GoalProfile, GoalSeedLine } from "@/shared/storage/goals";

import type { GoalStartingOption } from "./goal-starting-options";

/** Convert legacy single-seed fields or normalize stored `seedLines`. */
export function migrateLegacySeedsToLines(profile: GoalProfile): GoalSeedLine[] {
  if (profile.seedLines?.length) {
    return profile.seedLines.map((l) => ({
      id: l.id || `seed-${Math.random().toString(36).slice(2, 11)}`,
      sourceKey: l.sourceKey,
      amount: typeof l.amount === "number" ? l.amount : 0,
    }));
  }
  const key = profile.seedSourceKey ?? "none";
  const amt = typeof profile.seedAmount === "number" ? profile.seedAmount : 0;
  if (key === "none" && amt <= 0) return [];
  return [{ id: "migrated-seed", sourceKey: key, amount: amt }];
}

/** Drop duplicate non-custom keys (keep first). */
export function dedupeNonCustomSeedLines(lines: GoalSeedLine[]): GoalSeedLine[] {
  const seen = new Set<string>();
  const out: GoalSeedLine[] = [];
  for (const line of lines) {
    if (line.sourceKey === "custom") {
      out.push(line);
      continue;
    }
    if (seen.has(line.sourceKey)) continue;
    seen.add(line.sourceKey);
    out.push(line);
  }
  return out;
}

/** Remove lines whose keys no longer exist (except `custom`). */
export function sanitizeSeedLinesAgainstOptions(
  lines: GoalSeedLine[],
  seedKeys: Set<string>,
): GoalSeedLine[] {
  return dedupeNonCustomSeedLines(
    lines.filter(
      (l) => l.sourceKey === "custom" || (l.sourceKey !== "none" && seedKeys.has(l.sourceKey)),
    ),
  );
}

export function liveBalanceForSourceKey(
  sourceKey: string,
  options: GoalStartingOption[],
): number {
  if (sourceKey === "none" || sourceKey === "custom") return 0;
  const opt = options.find((o) => o.key === sourceKey);
  if (!opt || opt.isCustom) return 0;
  return Math.max(0, opt.amount);
}

/**
 * Sum of stored `amount` for `sourceKey` across all saved plans, except the
 * active plan uses `draft.seedLines`. The line `excludeLineId` (if any) is
 * omitted so capacity for that row can be computed.
 */
export function allocatedFromSourceKeyAcrossPlans(
  sourceKey: string,
  savedPlans: GoalProfile[],
  draft: GoalProfile,
  excludeLineId: string | undefined,
): number {
  if (sourceKey === "none" || sourceKey === "custom") return 0;
  let sum = 0;
  for (const plan of savedPlans) {
    if (plan.id === draft.id) continue;
    for (const l of plan.seedLines ?? []) {
      if (l.sourceKey !== sourceKey) continue;
      sum += Math.max(0, l.amount);
    }
  }
  for (const l of draft.seedLines ?? []) {
    if (l.sourceKey !== sourceKey) continue;
    if (excludeLineId && l.id === excludeLineId) continue;
    sum += Math.max(0, l.amount);
  }
  return sum;
}

/** Maximum ₫ this plan may assign from `sourceKey` on the given line (others' allocations subtracted). */
export function maxAllocationForSourceKey(
  sourceKey: string,
  options: GoalStartingOption[],
  savedPlans: GoalProfile[],
  draft: GoalProfile,
  excludeLineId: string | undefined,
): number {
  const live = liveBalanceForSourceKey(sourceKey, options);
  const takenElsewhere = allocatedFromSourceKeyAcrossPlans(
    sourceKey,
    savedPlans,
    draft,
    excludeLineId,
  );
  return Math.max(0, live - takenElsewhere);
}

/** Effective ₫ for projections after caps (live balance and cross-plan pool). */
export function effectiveGoalSeedLineAmount(
  line: GoalSeedLine,
  options: GoalStartingOption[],
  savedPlans: GoalProfile[],
  draft: GoalProfile,
): number {
  if (line.sourceKey === "custom") {
    return Math.max(0, line.amount);
  }
  const max = maxAllocationForSourceKey(
    line.sourceKey,
    options,
    savedPlans,
    draft,
    line.id,
  );
  return Math.min(Math.max(0, line.amount), max);
}

/** @deprecated Prefer {@link effectiveGoalSeedLineAmount} with plan context. */
export function resolvedSeedLineAmount(
  line: GoalSeedLine,
  options: GoalStartingOption[],
): number {
  if (line.sourceKey === "custom") {
    return Math.max(0, line.amount);
  }
  const opt = options.find((o) => o.key === line.sourceKey);
  if (opt && !opt.isCustom) {
    return Math.min(Math.max(0, line.amount), Math.max(0, opt.amount));
  }
  return Math.max(0, line.amount);
}

export function totalGoalStartingBalance(
  lines: GoalSeedLine[] | undefined,
  options: GoalStartingOption[],
  savedPlans: GoalProfile[],
  draft: GoalProfile,
): number {
  if (!lines?.length) return 0;
  return lines.reduce(
    (s, line) => s + effectiveGoalSeedLineAmount(line, options, savedPlans, draft),
    0,
  );
}

export function labelForSeedLine(
  line: GoalSeedLine,
  options: GoalStartingOption[],
): string {
  if (line.sourceKey === "custom") return "Custom amount";
  return options.find((o) => o.key === line.sourceKey)?.label ?? line.sourceKey;
}

export function appendGoalSeedLine(
  profile: GoalProfile,
  pendingKey: string,
  options: GoalStartingOption[],
  savedPlans: GoalProfile[],
): GoalProfile | null {
  if (!pendingKey || pendingKey === "none") return null;
  const opt = options.find((o) => o.key === pendingKey);
  if (!opt) return null;

  const lines = profile.seedLines ?? [];
  if (!opt.isCustom && lines.some((l) => l.sourceKey === pendingKey)) {
    return null;
  }

  const id = `seed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const draftForMax = { ...profile, seedLines: lines };
  const maxKeyed =
    pendingKey !== "custom"
      ? maxAllocationForSourceKey(pendingKey, options, savedPlans, draftForMax, undefined)
      : 0;
  const nextLine: GoalSeedLine = opt.isCustom
    ? { id, sourceKey: "custom", amount: 0 }
    : {
        id,
        sourceKey: pendingKey,
        amount: Math.min(Math.max(0, opt.amount), maxKeyed),
      };

  return {
    ...profile,
    seedLines: [...lines, nextLine],
  };
}

/** Clamp keyed line amounts so they never exceed the shared pool or live balance. */
export function clampSeedLinesToAllocationPool(
  lines: GoalSeedLine[],
  options: GoalStartingOption[],
  savedPlans: GoalProfile[],
  draft: GoalProfile,
): GoalSeedLine[] {
  return lines.map((l) => {
    if (l.sourceKey === "custom") return l;
    const max = maxAllocationForSourceKey(l.sourceKey, options, savedPlans, draft, l.id);
    return { ...l, amount: Math.min(Math.max(0, l.amount), max) };
  });
}

/**
 * After migration, keyed lines with amount 0 get a sensible default from the
 * remaining pool (legacy rows used live balance without persisting amount).
 */
export function ensureKeyedSeedDefaults(
  lines: GoalSeedLine[],
  options: GoalStartingOption[],
  savedPlans: GoalProfile[],
  draft: GoalProfile,
): GoalSeedLine[] {
  return lines.map((l) => {
    if (l.sourceKey === "custom" || l.sourceKey === "none") return l;
    const max = maxAllocationForSourceKey(l.sourceKey, options, savedPlans, draft, l.id);
    if (l.amount > 0) {
      return { ...l, amount: Math.min(l.amount, max) };
    }
    return { ...l, amount: max };
  });
}
