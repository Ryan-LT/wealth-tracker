"use client";

import { useCallback, useMemo, useState } from "react";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { ThemeSwitch } from "@/components/theme-switch";
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

import { FeasibilityEngine } from "./feasibility-engine";
import { GoalCreatorForm } from "./goal-creator-form";
import { ProjectionTimelineChart } from "./projection-timeline-chart";
import { SavedProfilesStrip } from "./saved-profiles-strip";

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
    checkpoints: normalizeStoredCheckpoints(p.checkpoints),
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
  const [editMode, setEditMode] = useState(
    () => goals.activeProfileId === GOAL_PLAN_NEW_SENTINEL,
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
    // New plans auto-enter edit mode; loading a saved plan starts in view mode.
    setEditMode(goals.activeProfileId === GOAL_PLAN_NEW_SENTINEL);
  }

  const cancelEdit = useCallback(() => {
    setDraft(
      normalizeGoalProfile(
        resolvePlanEditorProfile(goals),
        seedKeySet,
        seedOptions,
        goals.profiles,
      ),
    );
    setEditMode(false);
  }, [goals, seedKeySet, seedOptions]);

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
    setEditMode(false);
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
      return "Add target, date, and starting sources.";
    }
    if (applyMonthlyIncome && incomeMonthly <= 0 && projectedAtTarget < draft.targetAmount) {
      return "No monthly income in settings — only starting allocations count.";
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
    incomeMonthly,
    projectedAtTarget,
    startingBalance,
  ]);

  return (
    <>
      <Header fixed>
        <h1 className="text-base font-medium">Goal Plan</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Goal Plan</h1>
          <p className="text-sm text-muted-foreground">
            Set a target, allocate starting balances, and track feasibility.
          </p>
        </div>

        <SavedProfilesStrip
          profiles={goals.profiles}
          activeId={goals.activeProfileId}
          onLoad={loadProfile}
          onNew={startNewPlan}
          onDelete={deletePlan}
        />

        <Separator className="my-4" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-4">
            <GoalCreatorForm
              profile={draft}
              savedPlans={goals.profiles}
              seedOptions={seedOptions}
              monthlyIncomeTotal={incomeMonthly}
              editMode={editMode}
              onChange={setDraft}
              onSimulate={simulate}
              onSave={saveCurrentSetup}
              onEnterEdit={() => setEditMode(true)}
              onCancelEdit={cancelEdit}
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
          <div className="flex min-w-0 flex-col gap-4 lg:col-span-8">
            <ProjectionTimelineChart
              targetAmount={draft.targetAmount}
              startingAmount={startingBalance}
              monthlyIncome={effectiveMonthlyIncome}
              monthsToTarget={monthsToTarget}
              targetDateIso={draft.targetDate}
              checkpoints={draft.checkpoints ?? []}
            />
          </div>
        </div>
      </Main>
    </>
  );
}
