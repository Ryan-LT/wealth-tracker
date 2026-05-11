"use client";

import { useCallback, useMemo, useState } from "react";

import {
  buildGoalStartingOptions,
  clampSeedLinesToAllocationPool,
  ensureKeyedSeedDefaults,
  formatVnd,
  migrateLegacySeedsToLines,
  sanitizeSeedLinesAgainstOptions,
  totalGoalStartingBalance,
  totalMonthlyIncomeFromSources,
  type GoalStartingOption,
} from "@/shared/lib";
import {
  ASSETS_SEED,
  EMPTY_GOAL_PROFILE,
  GOAL_PLAN_NEW_SENTINEL,
  GOALS_SEED,
  INCOME_SOURCES_SEED,
  SETTINGS_ASSETS_SEED,
  type GoalProfile,
  type GoalsState,
  useTable,
} from "@/shared/storage";
import { TopAppBar } from "@/widgets/top-app-bar";

import { FeasibilityEngine } from "./FeasibilityEngine";
import { GoalCreatorForm } from "./GoalCreatorForm";
import { ProjectionTimelineChart } from "./ProjectionTimelineChart";
import { SavedProfilesStrip } from "./SavedProfilesStrip";

function profileById(profiles: GoalProfile[], id: string): GoalProfile | undefined {
  return profiles.find((p) => p.id === id);
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
  lines = ensureKeyedSeedDefaults(lines, seedOptions, savedPlans, { ...p, seedLines: lines });
  return {
    ...p,
    seedLines: lines,
    monthlyContribution: typeof p.monthlyContribution === "number" ? p.monthlyContribution : 0,
    includeMonthlyIncome: p.includeMonthlyIncome !== false,
  };
}

export function GoalsPage() {
  const [goals, setGoals] = useTable("goals", GOALS_SEED);
  const [assets] = useTable("assets", ASSETS_SEED);
  const [settingsAssets] = useTable("settingsAssets", SETTINGS_ASSETS_SEED);
  const [sources] = useTable("incomeSources", INCOME_SOURCES_SEED);

  const seedOptions = useMemo(
    () => buildGoalStartingOptions(assets, settingsAssets),
    [assets, settingsAssets],
  );

  const seedKeySet = useMemo(() => new Set(seedOptions.map((o) => o.key)), [seedOptions]);

  const incomeMonthly = useMemo(() => totalMonthlyIncomeFromSources(sources), [sources]);

  const [draft, setDraft] = useState<GoalProfile>(() =>
    normalizeGoalProfile(resolvePlanEditorProfile(goals), seedKeySet, seedOptions, goals.profiles),
  );
  const [lastLoadedKey, setLastLoadedKey] = useState(goals.activeProfileId);

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

  function saveCurrentSetup() {
    const cleanLines = sanitizeSeedLinesAgainstOptions(draft.seedLines ?? [], seedKeySet);
    setGoals((prev) => {
      const existingById =
        draft.id !== "" ? prev.profiles.find((p) => p.id === draft.id) : undefined;
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
  }

  function simulate() {
    setDraft((d) => ({ ...d }));
  }

  const monthsToTarget = useMemo(() => {
    if (!draft.targetDate) return 1;
    const now = new Date();
    const target = new Date(draft.targetDate);
    if (Number.isNaN(target.getTime())) return 1;
    const months =
      (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    return Math.max(1, months);
  }, [draft.targetDate]);

  const startingBalance = useMemo(
    () => totalGoalStartingBalance(draft.seedLines, seedOptions, goals.profiles, draft),
    [draft, goals.profiles, seedOptions],
  );

  const applyMonthlyIncome = draft.includeMonthlyIncome !== false;
  const effectiveMonthlyIncome = applyMonthlyIncome ? incomeMonthly : 0;

  const projectedAtTarget = useMemo(
    () => startingBalance + effectiveMonthlyIncome * monthsToTarget,
    [startingBalance, effectiveMonthlyIncome, monthsToTarget],
  );

  const note = useMemo(() => {
    if (draft.targetAmount <= 0 || !draft.targetDate) {
      return "Enter a plan name, target amount, target date, and one or more starting sources to see a projection.";
    }
    if (applyMonthlyIncome && incomeMonthly <= 0 && projectedAtTarget < draft.targetAmount) {
      return "Add monthly income under Asset configuration → Income sources. Without it, only your allocated starting amounts count toward the plan.";
    }
    if (!applyMonthlyIncome && projectedAtTarget < draft.targetAmount) {
      const gap = draft.targetAmount - projectedAtTarget;
      return `Monthly income is off for this plan — projection stays at your allocated starting total (${formatVnd(startingBalance)}). Short by about ${formatVnd(gap)}. Turn income on, add starting allocations, extend the date, or lower the target.`;
    }
    if (projectedAtTarget >= draft.targetAmount) {
      const surplus = projectedAtTarget - draft.targetAmount;
      return surplus > 0
        ? `Linear projection exceeds the target by about ${formatVnd(surplus)} at the goal date.`
        : "Linear projection reaches the target on time.";
    }
    const gap = draft.targetAmount - projectedAtTarget;
    return `Short by about ${formatVnd(gap)} at the goal date. Raise income or allocations, extend the date, or lower the target.`;
  }, [
    applyMonthlyIncome,
    draft.targetAmount,
    draft.targetDate,
    incomeMonthly,
    projectedAtTarget,
    startingBalance,
  ]);

  return (
    <>
      <TopAppBar />
      <main className="p-margin-mobile md:p-stack-lg max-w-container-max mx-auto pb-24 md:pb-8 w-full">
        <header className="mb-stack-lg">
          <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-background">
            Goal Plan
          </h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Allocate starting amounts from each asset (shared across all plans so totals never
            exceed what you really hold). Other plans reserve their slice; this editor shows how
            much is left. Income from Asset configuration can be applied monthly toward the target,
            or turned off for a fixed starting-only view. Use New plan for another goal; Load
            switches plans.
          </p>
        </header>

        <SavedProfilesStrip
          profiles={goals.profiles}
          activeId={goals.activeProfileId}
          onLoad={loadProfile}
          onNew={startNewPlan}
          onDelete={deletePlan}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-md lg:gap-stack-lg">
          <div className="lg:col-span-4 flex flex-col gap-stack-md">
            <GoalCreatorForm
              profile={draft}
              savedPlans={goals.profiles}
              seedOptions={seedOptions}
              monthlyIncomeTotal={incomeMonthly}
              onChange={setDraft}
              onSimulate={simulate}
              onSave={saveCurrentSetup}
            />
            <FeasibilityEngine
              monthlyIncome={effectiveMonthlyIncome}
              incomeConfiguredTotal={incomeMonthly}
              startingBalance={startingBalance}
              projectedBalanceAtTarget={projectedAtTarget}
              targetAmount={draft.targetAmount}
              monthsToTarget={monthsToTarget}
              note={note}
            />
          </div>
          <div className="lg:col-span-8 flex flex-col gap-stack-md">
            <ProjectionTimelineChart
              targetAmount={draft.targetAmount}
              startingAmount={startingBalance}
              monthlyIncome={effectiveMonthlyIncome}
              monthsToTarget={monthsToTarget}
              targetDateIso={draft.targetDate}
            />
          </div>
        </div>
      </main>
    </>
  );
}
