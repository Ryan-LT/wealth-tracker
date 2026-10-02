"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";

import {
  buildGoalPlanSummaries,
  computeGoalFeasibility,
  GOAL_PLAN_NEW_SENTINEL,
  goalProgressPercent,
  type GoalStartingOption,
  type GoalsState,
} from "@/entities/goal";
import { FeasibilityBadge } from "@/entities/goal/ui";
import { cn } from "@/shared/lib/cn";
import { formatDate } from "@/shared/lib/format";
import { Card } from "@/shared/ui/kit/card";
import { Progress } from "@/shared/ui/kit/progress";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/shared/ui/kit/select";
import { Money } from "@/shared/ui/money";

type PlanListProps = {
  goals: GoalsState;
  seedOptions: GoalStartingOption[];
  monthlyNet: number;
  activeId: string;
  isComposingNew: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
};

function usePlanRows(goals: GoalsState, seedOptions: GoalStartingOption[], monthlyNet: number) {
  return useMemo(
    () =>
      goals.profiles.length === 0
        ? []
        : buildGoalPlanSummaries(goals, seedOptions, 0).map((s) => ({
            ...s,
            pct: goalProgressPercent(s.saved, s.targetAmount),
            health: computeGoalFeasibility({
              saved: s.saved,
              targetAmount: s.targetAmount,
              targetDateIso: s.targetDate,
              includeMonthlyIncome: s.includeMonthlyIncome,
              // Only this plan's share of the monthly savings (never the whole amount per plan).
              estimatedMonthlyNet: monthlyNet * s.monthlyShare,
              expectedReturnPct: s.expectedReturnPct,
            }),
          })),
    [goals, seedOptions, monthlyNet],
  );
}

/** Desktop master list. */
export function PlanList({ goals, seedOptions, monthlyNet, activeId, isComposingNew, onSelect }: PlanListProps) {
  const rows = usePlanRows(goals, seedOptions, monthlyNet);
  return (
    <Card className="gap-0 py-2">
      <p className="px-4 pt-2 pb-2 text-xs font-medium text-muted-foreground">Plans · {goals.profiles.length}</p>
      <ul className="grid gap-0.5 px-2">
        {isComposingNew ? (
          <li>
            <div className="rounded-md border border-dashed border-primary/40 bg-primary-soft px-3 py-2.5 text-sm font-medium text-primary-soft-foreground" aria-current="true">
              New plan (unsaved)
            </div>
          </li>
        ) : null}
        {rows.map((r) => {
          const active = !isComposingNew && r.planId === activeId;
          return (
            <li key={r.key}>
              <button
                type="button"
                onClick={() => r.planId && onSelect(r.planId)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "grid w-full gap-1.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none",
                  active && "bg-primary-soft hover:bg-primary-soft",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-sm font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{r.pct}%</span>
                </div>
                <Progress value={r.pct} className="h-1" />
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="truncate">
                    <Money value={r.targetAmount} compact interactive={false} /> {r.targetDate ? `· ${formatDate(r.targetDate, "monthYear")}` : ""}
                  </span>
                  <FeasibilityBadge tone={r.health.tone} code={r.health.code} showHint={false} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      {rows.length === 0 && !isComposingNew ? (
        <p className="px-4 py-3 text-sm text-muted-foreground">None saved — use New plan, then Save.</p>
      ) : null}
    </Card>
  );
}

/** Phone / narrow switcher. */
export function PlanSwitcher({ goals, activeId, isComposingNew, onSelect, onNew }: PlanListProps) {
  const value = isComposingNew ? GOAL_PLAN_NEW_SENTINEL : activeId || goals.profiles[0]?.id || GOAL_PLAN_NEW_SENTINEL;
  return (
    <Select value={value} onValueChange={(v) => (v === GOAL_PLAN_NEW_SENTINEL ? onNew() : onSelect(v))}>
      <SelectTrigger aria-label="Choose a plan" className="h-10">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {goals.profiles.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name.trim() || "Untitled plan"}
          </SelectItem>
        ))}
        {goals.profiles.length > 0 ? <SelectSeparator /> : null}
        <SelectItem value={GOAL_PLAN_NEW_SENTINEL}>
          <Plus className="size-4" />
          {isComposingNew ? "New plan (unsaved)" : "New plan"}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
