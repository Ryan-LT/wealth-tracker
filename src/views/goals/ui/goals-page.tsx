"use client";

import { CheckCircle2, TriangleAlert } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Header } from "@/widgets/page-header";
import { Main } from "@/widgets/page-shell";
import { ProfileDropdown } from "@/widgets/profile-menu";
import { ThemeSwitch } from "@/widgets/theme-switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  buildGoalStartingOptions,
  clampSeedLinesToAllocationPool,
  ensureKeyedSeedDefaults,
  formatVnd,
  migrateLegacySeedsToLines,
  normalizeStoredCheckpoints,
  sanitizeSeedLinesAgainstOptions,
  totalGoalStartingBalance,
  estimatedMonthlyNetCashflow,
  totalMonthlyIncomeFromSources,
  type GoalStartingOption,
} from "@/shared/lib";
import {
  ASSETS_SEED,
  EMPTY_GOAL_PROFILE,
  GOAL_PLAN_NEW_SENTINEL,
  GOALS_SEED,
  INCOME_SOURCES_SEED,
  PREFERENCES_SEED,
  SETTINGS_ASSETS_SEED,
  type GoalProfile,
  type GoalsState,
  flushTablesNow,
  useTable,
} from "@/shared/storage";

import { FeasibilityEngine } from "./feasibility-engine";
import { GoalCreatorForm } from "./goal-creator-form";
import { ProjectionTimelineChart } from "./projection-timeline-chart";
import { SavedProfilesStrip } from "./saved-profiles-strip";

function profileById(
  profiles: GoalProfile[],
  id: string,
): GoalProfile | undefined {
  return profiles.find((p) => p.id === id);
}

function GoalStatusIndicator({
  startingBalance,
  targetAmount,
}: {
  startingBalance: number;
  targetAmount: number;
}) {
  const hasTarget = targetAmount > 0;
  const met = hasTarget && startingBalance >= targetAmount;
  const gap = hasTarget ? Math.max(0, targetAmount - startingBalance) : 0;
  const surplus = hasTarget ? Math.max(0, startingBalance - targetAmount) : 0;

  return (
    <Card variant="secondary">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Goal status</CardTitle>
        <p className="text-xs text-muted-foreground">
          Monthly income is excluded — comparing starting balance to target only.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex h-72 flex-col items-center justify-center gap-3 text-center">
          {!hasTarget ? (
            <>
              <p className="text-lg font-semibold text-muted-foreground">
                Add a target amount to evaluate
              </p>
            </>
          ) : met ? (
            <>
              <CheckCircle2 className="size-12 text-emerald-500" />
              <p className="text-2xl font-semibold">Goal met</p>
              <p className="text-sm text-muted-foreground font-data-tabular tabular-nums">
                {formatVnd(startingBalance)} starting vs {formatVnd(targetAmount)} target
              </p>
              {surplus > 0 ? (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 font-data-tabular tabular-nums">
                  Surplus {formatVnd(surplus)}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <TriangleAlert className="size-12 text-destructive" />
              <p className="text-2xl font-semibold">Goal not met</p>
              <p className="text-sm text-muted-foreground font-data-tabular tabular-nums">
                {formatVnd(startingBalance)} starting vs {formatVnd(targetAmount)} target
              </p>
              <p className="text-sm font-medium text-destructive font-data-tabular tabular-nums">
                Short by {formatVnd(gap)}
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function resolvePlanEditorProfile(goals: GoalsState): GoalProfile {
  if (goals.activeProfileId === GOAL_PLAN_NEW_SENTINEL) {
    return EMPTY_GOAL_PROFILE;
  }
  return (
    profileById(goals.profiles, goals.activeProfileId) ??
    goals.profiles[0] ??
    EMPTY_GOAL_PROFILE
  );
}

function normalizeGoalProfile(
  p: GoalProfile,
  seedKeys: Set<string>,
  seedOptions: GoalStartingOption[],
  savedPlans: GoalProfile[],
): GoalProfile {
  const raw = migrateLegacySeedsToLines(p);
  let lines = sanitizeSeedLinesAgainstOptions(raw, seedKeys);
  lines = ensureKeyedSeedDefaults(lines, seedOptions, savedPlans, {
    ...p,
    seedLines: lines,
  });
  return {
    ...p,
    seedLines: lines,
    checkpoints: normalizeStoredCheckpoints(p.checkpoints),
    monthlyContribution:
      typeof p.monthlyContribution === "number" ? p.monthlyContribution : 0,
    includeMonthlyIncome: p.includeMonthlyIncome !== false,
  };
}

export function GoalsPage() {
  const [goals, setGoals] = useTable("goals", GOALS_SEED);
  const [assets] = useTable("assets", ASSETS_SEED);
  const [settingsAssets] = useTable("settingsAssets", SETTINGS_ASSETS_SEED);
  const [sources] = useTable("incomeSources", INCOME_SOURCES_SEED);
  const [prefs] = useTable("preferences", PREFERENCES_SEED);

  const seedOptions = useMemo(
    () => buildGoalStartingOptions(assets, settingsAssets),
    [assets, settingsAssets],
  );
  const seedKeySet = useMemo(
    () => new Set(seedOptions.map((o) => o.key)),
    [seedOptions],
  );
  const incomeMonthly = useMemo(
    () => totalMonthlyIncomeFromSources(sources),
    [sources],
  );

  const [draft, setDraft] = useState<GoalProfile>(() =>
    normalizeGoalProfile(
      resolvePlanEditorProfile(goals),
      seedKeySet,
      seedOptions,
      goals.profiles,
    ),
  );
  const [lastLoadedKey, setLastLoadedKey] = useState(goals.activeProfileId);

  const savedProfile = useMemo(
    () =>
      normalizeGoalProfile(
        resolvePlanEditorProfile(goals),
        seedKeySet,
        seedOptions,
        goals.profiles,
      ),
    [goals, seedKeySet, seedOptions],
  );

  if (lastLoadedKey !== goals.activeProfileId) {
    setLastLoadedKey(goals.activeProfileId);
    setDraft(
      normalizeGoalProfile(
        resolvePlanEditorProfile(goals),
        seedKeySet,
        seedOptions,
        goals.profiles,
      ),
    );
  }

  const loadProfile = useCallback(
    (id: string) => setGoals((prev) => ({ ...prev, activeProfileId: id })),
    [setGoals],
  );

  const startNewPlan = useCallback(() => {
    setGoals((prev) => ({ ...prev, activeProfileId: GOAL_PLAN_NEW_SENTINEL }));
  }, [setGoals]);

  const deletePlan = useCallback(
    (id: string) => {
      setGoals((prev) => {
        const nextProfiles = prev.profiles.filter((p) => p.id !== id);
        let nextActive = prev.activeProfileId;
        if (nextActive === id) {
          nextActive = nextProfiles[0]?.id ?? GOAL_PLAN_NEW_SENTINEL;
        } else if (
          nextActive &&
          nextActive !== GOAL_PLAN_NEW_SENTINEL &&
          !nextProfiles.some((p) => p.id === nextActive)
        ) {
          nextActive = nextProfiles[0]?.id ?? GOAL_PLAN_NEW_SENTINEL;
        }
        return { ...prev, profiles: nextProfiles, activeProfileId: nextActive };
      });
    },
    [setGoals],
  );

  const persistPlan = useCallback(async () => {
    const cleanLines = sanitizeSeedLinesAgainstOptions(
      draft.seedLines ?? [],
      seedKeySet,
    );
    setGoals((prev) => {
      const existingById =
        draft.id !== ""
          ? prev.profiles.find((p) => p.id === draft.id)
          : undefined;
      const id = existingById ? draft.id : `goal-${Date.now()}`;

      const savedBase: GoalProfile = {
        ...(existingById ?? {}),
        id,
        name: draft.name.trim() || "Untitled plan",
        targetAmount: draft.targetAmount,
        targetDate: draft.targetDate,
        monthlyContribution: incomeMonthly,
        includeMonthlyIncome: draft.includeMonthlyIncome !== false,
        seedLines: cleanLines,
        checkpoints: normalizeStoredCheckpoints(draft.checkpoints),
      };

      const clampedLines = clampSeedLinesToAllocationPool(
        cleanLines,
        seedOptions,
        prev.profiles,
        savedBase,
      );
      const saved: GoalProfile = { ...savedBase, seedLines: clampedLines };

      const hasId = prev.profiles.some((p) => p.id === id);
      const profiles = hasId
        ? prev.profiles.map((p) => (p.id === id ? saved : p))
        : [...prev.profiles, saved];

      return {
        ...prev,
        profiles,
        activeProfileId: id,
      };
    });
    await flushTablesNow();
  }, [draft, incomeMonthly, seedKeySet, seedOptions, setGoals]);

  function simulate() {
    setDraft((d) => ({ ...d }));
  }

  const monthsToTarget = useMemo(() => {
    if (!draft.targetDate) return 1;
    const now = new Date();
    const target = new Date(draft.targetDate);
    if (Number.isNaN(target.getTime())) return 1;
    const MS_PER_MONTH = (1000 * 60 * 60 * 24 * 365.25) / 12;
    const ms = Math.max(0, target.getTime() - now.getTime());
    return Math.max(1, Math.round(ms / MS_PER_MONTH));
  }, [draft.targetDate]);

  const startingBalance = useMemo(
    () =>
      totalGoalStartingBalance(
        draft.seedLines,
        seedOptions,
        goals.profiles,
        draft,
      ),
    [draft, goals.profiles, seedOptions],
  );

  const applyMonthlyIncome = draft.includeMonthlyIncome !== false;
  const householdMonthlyNet = useMemo(
    () => estimatedMonthlyNetCashflow(prefs, incomeMonthly),
    [prefs, incomeMonthly],
  );
  const effectiveMonthlyContribution = applyMonthlyIncome ? householdMonthlyNet : 0;

  const projectedAtTarget = useMemo(
    () => startingBalance + effectiveMonthlyContribution * monthsToTarget,
    [startingBalance, effectiveMonthlyContribution, monthsToTarget],
  );

  const note = useMemo(() => {
    if (draft.targetAmount <= 0 || !draft.targetDate) {
      return "Add target, date, and starting sources.";
    }
    if (
      applyMonthlyIncome &&
      incomeMonthly <= 0 &&
      projectedAtTarget < draft.targetAmount
    ) {
      return "No monthly income in settings — only starting allocations count.";
    }
    if (
      applyMonthlyIncome &&
      incomeMonthly > 0 &&
      effectiveMonthlyContribution <= 0 &&
      projectedAtTarget < draft.targetAmount
    ) {
      return "Monthly net is zero or negative after spending — increase income or lower average spending in settings.";
    }
    if (!applyMonthlyIncome && projectedAtTarget < draft.targetAmount) {
      const gap = draft.targetAmount - projectedAtTarget;
      return `Income off for this plan — flat at ${formatVnd(startingBalance)}; short ~${formatVnd(gap)}.`;
    }
    if (projectedAtTarget >= draft.targetAmount) {
      const surplus = projectedAtTarget - draft.targetAmount;
      return surplus > 0 ? `Ahead by ~${formatVnd(surplus)}.` : "On target.";
    }
    const gap = draft.targetAmount - projectedAtTarget;
    return `Short ~${formatVnd(gap)} vs target.`;
  }, [
    applyMonthlyIncome,
    draft.targetAmount,
    draft.targetDate,
    effectiveMonthlyContribution,
    incomeMonthly,
    projectedAtTarget,
    startingBalance,
  ]);

  return (
    <>
      <Header fixed>
        <h1 className="text-lg font-semibold md:text-base md:font-medium">
          Goal Plan
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <SavedProfilesStrip
          profiles={goals.profiles}
          activeId={goals.activeProfileId}
          onLoad={loadProfile}
          onNew={startNewPlan}
          onDelete={deletePlan}
        />

        <Separator className="my-4" />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-4">
            <GoalCreatorForm
              profile={draft}
              savedProfile={savedProfile}
              savedPlans={goals.profiles}
              seedOptions={seedOptions}
              monthlyIncomeTotal={incomeMonthly}
              monthlyNetContribution={householdMonthlyNet}
              onChange={setDraft}
              onSimulate={simulate}
              onPersist={persistPlan}
            />
            <FeasibilityEngine
              monthlyNetContribution={effectiveMonthlyContribution}
              monthlyIncomeTotal={incomeMonthly}
              startingBalance={startingBalance}
              projectedBalanceAtTarget={projectedAtTarget}
              targetAmount={draft.targetAmount}
              monthsToTarget={monthsToTarget}
              note={note}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-4 lg:col-span-8">
            {applyMonthlyIncome ? (
              <ProjectionTimelineChart
                targetAmount={draft.targetAmount}
                startingAmount={startingBalance}
                monthlyNetContribution={effectiveMonthlyContribution}
                monthsToTarget={monthsToTarget}
                targetDateIso={draft.targetDate}
                checkpoints={draft.checkpoints ?? []}
              />
            ) : (
              <GoalStatusIndicator
                startingBalance={startingBalance}
                targetAmount={draft.targetAmount}
              />
            )}
          </div>
        </div>
      </Main>
    </>
  );
}
