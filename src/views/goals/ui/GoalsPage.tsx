"use client";

import { useCallback, useMemo, useState } from "react";

import {
  EMPTY_GOAL_PROFILE,
  GOALS_SEED,
  type GoalProfile,
  useTable,
} from "@/shared/storage";
import { TopAppBar } from "@/widgets/top-app-bar";

import { FeasibilityEngine } from "./FeasibilityEngine";
import { GoalCreatorForm } from "./GoalCreatorForm";
import { ProjectionTimelineChart } from "./ProjectionTimelineChart";
import { SavedProfilesStrip } from "./SavedProfilesStrip";
import { WhatIfSliders } from "./WhatIfSliders";

function profileById(profiles: GoalProfile[], id: string): GoalProfile | undefined {
  return profiles.find((p) => p.id === id);
}

export function GoalsPage() {
  const [goals, setGoals] = useTable("goals", GOALS_SEED);
  const activeProfile =
    profileById(goals.profiles, goals.activeProfileId) ??
    goals.profiles[0] ??
    EMPTY_GOAL_PROFILE;

  const [draft, setDraft] = useState<GoalProfile>(activeProfile);
  const [lastLoadedId, setLastLoadedId] = useState(activeProfile.id);
  const [timelineShift, setTimelineShift] = useState(0);

  // React-recommended "store information from previous renders" pattern:
  // when the active profile changes (e.g. user clicks "Load" on the strip),
  // reset the draft synchronously during render. React discards the in-flight
  // render and retries with the updated state.
  if (lastLoadedId !== goals.activeProfileId) {
    setLastLoadedId(goals.activeProfileId);
    setDraft(activeProfile);
  }

  const loadProfile = useCallback(
    (id: string) => setGoals((prev) => ({ ...prev, activeProfileId: id })),
    [setGoals],
  );

  function saveCurrentSetup() {
    setGoals((prev) => {
      const existingById =
        draft.id !== "" ? prev.profiles.find((p) => p.id === draft.id) : undefined;
      const id = existingById ? draft.id : `goal-${Date.now()}`;

      const saved: GoalProfile = {
        ...(existingById ?? {}),
        id,
        name: draft.name.trim() || "Untitled goal",
        targetAmount: draft.targetAmount,
        targetDate: draft.targetDate,
        monthlyContribution: draft.monthlyContribution,
      };

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
    // For now, the feasibility engine numbers below already react to draft changes;
    // explicitly re-set draft to ensure derived values flow through React state.
    setDraft({ ...draft });
  }

  const monthsToTarget = useMemo(() => {
    if (!draft.targetDate) return 1;
    const now = new Date();
    const target = new Date(draft.targetDate);
    const months = Math.max(
      1,
      (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()) - timelineShift,
    );
    return months;
  }, [draft.targetDate, timelineShift]);

  const requiredMonthly = useMemo(
    () => Math.ceil(draft.targetAmount / monthsToTarget),
    [draft.targetAmount, monthsToTarget],
  );

  const note = useMemo(() => {
    const rate = draft.monthlyContribution;
    if (draft.targetAmount <= 0 || !draft.targetDate) {
      return "Set a target amount, date, and monthly contribution to see tailored guidance.";
    }
    if (requiredMonthly <= 0) return "";
    if (rate >= requiredMonthly) {
      const surplus = rate - requiredMonthly;
      const monthsEarly = Math.floor((surplus * monthsToTarget) / Math.max(1, requiredMonthly));
      return `At your entered monthly contribution, you are on track to reach this goal ${monthsEarly} months early.`;
    }
    return "Increase the monthly contribution or extend the timeline to bring this goal back on track.";
  }, [draft.monthlyContribution, draft.targetAmount, draft.targetDate, requiredMonthly, monthsToTarget]);

  return (
    <>
      <TopAppBar />
      <main className="p-margin-mobile md:p-stack-lg max-w-container-max mx-auto pb-24 md:pb-8 w-full">
        <header className="mb-stack-lg">
          <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-background">
            Goal Simulator
          </h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Plan and forecast major financial milestones.
          </p>
        </header>

        <SavedProfilesStrip
          profiles={goals.profiles}
          activeId={goals.activeProfileId}
          onLoad={loadProfile}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-md lg:gap-stack-lg">
          <div className="lg:col-span-4 flex flex-col gap-stack-md">
            <GoalCreatorForm
              profile={draft}
              onChange={setDraft}
              onSimulate={simulate}
              onSave={saveCurrentSetup}
            />
            <FeasibilityEngine
              requiredMonthly={requiredMonthly}
              currentRate={draft.monthlyContribution}
              note={note}
            />
          </div>
          <div className="lg:col-span-8 flex flex-col gap-stack-md">
            <ProjectionTimelineChart
              targetAmount={draft.targetAmount}
              progress={Math.min(
                1,
                draft.monthlyContribution / Math.max(1, requiredMonthly),
              )}
            />
            <WhatIfSliders
              monthlyContribution={draft.monthlyContribution}
              onMonthlyContributionChange={(monthlyContribution) =>
                setDraft({ ...draft, monthlyContribution })
              }
              timelineShiftMonths={timelineShift}
              onTimelineShiftChange={setTimelineShift}
            />
          </div>
        </div>
      </main>
    </>
  );
}
