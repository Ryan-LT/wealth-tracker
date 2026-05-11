import type { GoalProfile, GoalSeedLine } from "@/shared/storage/goals";

import type { GoalStartingOption } from "./goalStartingOptions";

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

export function resolvedSeedLineAmount(
  line: GoalSeedLine,
  options: GoalStartingOption[],
): number {
  if (line.sourceKey === "custom") {
    return Math.max(0, line.amount);
  }
  const opt = options.find((o) => o.key === line.sourceKey);
  if (opt && !opt.isCustom) {
    return Math.max(0, opt.amount);
  }
  return Math.max(0, line.amount);
}

export function totalGoalStartingBalance(
  lines: GoalSeedLine[] | undefined,
  options: GoalStartingOption[],
): number {
  if (!lines?.length) return 0;
  return lines.reduce((s, line) => s + resolvedSeedLineAmount(line, options), 0);
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
): GoalProfile | null {
  if (!pendingKey || pendingKey === "none") return null;
  const opt = options.find((o) => o.key === pendingKey);
  if (!opt) return null;

  const lines = profile.seedLines ?? [];
  if (!opt.isCustom && lines.some((l) => l.sourceKey === pendingKey)) {
    return null;
  }

  const id = `seed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const nextLine: GoalSeedLine = opt.isCustom
    ? { id, sourceKey: "custom", amount: 0 }
    : { id, sourceKey: pendingKey, amount: opt.amount };

  return {
    ...profile,
    seedLines: [...lines, nextLine],
  };
}
