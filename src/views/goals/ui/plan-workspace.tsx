"use client";

import { CalendarClock, Coins, MoreHorizontal, Target, Trash2, TrendingUp, Wallet } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  computeGoalProjection,
  describeGoalProjectionNote,
  goalProjectionNoteTone,
  profilesWithDraft,
  resolveMonthlyShares,
  revertPlanSection,
  setCheckpointPaid,
  totalGoalStartingBalance,
  type GoalProfile,
} from "@/entities/goal";
import { useI18n } from "@/shared/i18n";
import { formatDate, formatMoney, formatMonths, formatPercent } from "@/shared/lib/format";
import { Callout } from "@/shared/ui/callout";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Button } from "@/shared/ui/kit/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/kit/dropdown-menu";
import { Money } from "@/shared/ui/money";
import { StatCard, StatGrid } from "@/shared/ui/stat-card";
import { StatusBadge } from "@/shared/ui/status-badge";

import type { GoalPlanEditor } from "../model/use-goal-plan-editor";
import { BreakdownCard } from "./breakdown-card";
import { CheckpointsCard } from "./checkpoints-card";
import { PlanDetailsCard } from "./plan-details-card";
import { ProjectionCard, StartingOnlyCard } from "./projection-card";
import { StartingBalancesCard } from "./starting-balances-card";

/**
 * One plan's editor. Mounted with `key={activeProfileId}` so the draft resets
 * whenever another plan is selected (or a new plan gets its id).
 */
export function PlanWorkspace({ editor }: { editor: GoalPlanEditor }) {
  const { t } = useI18n();
  const g = t.goals;
  const { goals, savedProfile, seedOptions, incomeMonthly, householdMonthlyNet, isComposingNew, persistPlan, deletePlan } = editor;
  const [draft, setDraft] = useState<GoalProfile>(savedProfile);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const startingBalance = useMemo(
    () => totalGoalStartingBalance(draft.seedLines, seedOptions, goals.profiles, draft),
    [draft, seedOptions, goals.profiles],
  );
  // This plan's slice of the monthly net, with the draft's share in place of the saved one.
  const shares = useMemo(() => {
    const all = profilesWithDraft(goals.profiles, draft);
    const resolved = resolveMonthlyShares(all);
    const key = draft.id || "__draft__";
    const others = all.filter((p) => p.id !== key && p.includeMonthlyIncome !== false);
    return {
      share: resolved.byPlan.get(key) ?? 0,
      overAllocated: resolved.overAllocated,
      otherPlans: others.length,
      // What an automatic share would be right now (if this plan had no explicit %).
      automatic: resolveMonthlyShares(profilesWithDraft(goals.profiles, { ...draft, monthlySharePct: undefined })).byPlan.get(key) ?? 0,
    };
  }, [goals.profiles, draft]);
  const projection = useMemo(
    () =>
      computeGoalProjection({
        startingBalance,
        targetAmount: draft.targetAmount,
        targetDateIso: draft.targetDate,
        includeMonthlyIncome: draft.includeMonthlyIncome,
        incomeMonthly,
        householdMonthlyNet,
        monthlyShare: shares.share,
        expectedReturnPct: draft.expectedReturnPct,
      }),
    [startingBalance, draft.targetAmount, draft.targetDate, draft.includeMonthlyIncome, draft.expectedReturnPct, incomeMonthly, householdMonthlyNet, shares.share],
  );

  const save = useCallback(
    async (next: GoalProfile, message: string) => {
      setDraft(next);
      const ok = await persistPlan(next);
      if (ok) toast.success(message);
      else toast.warning(g.workspace.toasts.savedLocally, { description: g.workspace.toasts.savedLocallyDescription });
    },
    [persistPlan, g],
  );

  const preview = useCallback(
    (v: {
      name: string;
      targetAmount: number;
      targetDate: string;
      includeMonthlyIncome: boolean;
      monthlySharePct?: number;
      expectedReturnPct?: number;
    }) =>
      setDraft((d) => ({ ...d, ...v })),
    [],
  );

  const delta = projection.projectedAtTarget - draft.targetAmount;
  const displayName = draft.name.trim() || (isComposingNew ? g.list.newPlan : t.common.untitledPlan);

  const details = (
    <PlanDetailsCard
      draft={draft}
      startEditing={isComposingNew}
      incomeMonthly={incomeMonthly}
      householdMonthlyNet={householdMonthlyNet}
      shares={shares}
      onPreview={preview}
      onCancel={() => setDraft((d) => revertPlanSection(revertPlanSection(d, savedProfile, "basics"), savedProfile, "income"))}
      onSave={(v) => save({ ...draft, ...v }, isComposingNew ? g.workspace.toasts.planCreated : g.workspace.toasts.planSaved)}
    />
  );

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight">{displayName}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {isComposingNew ? <StatusBadge tone="info">{g.status.unsaved}</StatusBadge> : null}
            {draft.targetDate ? (
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3.5" /> {g.workspace.targetDate({ date: formatDate(draft.targetDate) })}
              </span>
            ) : null}
            {projection.status !== "unset" ? (
              <StatusBadge tone={projection.status === "feasible" ? "success" : "danger"} dot>
                {projection.status === "feasible" ? g.status.feasible : g.status.shortfall}
              </StatusBadge>
            ) : null}
          </div>
        </div>
        {!isComposingNew ? (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label={g.workspace.planActions}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
                <Trash2 />
                {g.workspace.deletePlan}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {isComposingNew ? details : null}

      <StatGrid>
        <StatCard
          label={g.workspace.kpi.target}
          icon={Target}
          value={draft.targetAmount > 0 ? <Money value={draft.targetAmount} compact /> : "—"}
          hint={draft.targetDate ? g.workspace.kpi.byDate({ date: formatDate(draft.targetDate) }) : g.workspace.kpi.noDate}
        />
        <StatCard
          label={g.workspace.kpi.allocated}
          icon={Coins}
          value={<Money value={startingBalance} compact />}
          hint={t.common.sources({ count: draft.seedLines?.length ?? 0 })}
        />
        <StatCard
          label={g.workspace.kpi.projected}
          icon={TrendingUp}
          value={<Money value={projection.projectedAtTarget} compact />}
          hint={draft.targetAmount > 0 ? <Money value={delta} compact signed tone="auto" /> : g.workspace.kpi.setTarget}
          aside={draft.targetAmount > 0 ? <span>{g.workspace.kpi.vsTarget}</span> : null}
        />
        <StatCard
          label={g.workspace.kpi.monthly}
          icon={Wallet}
          value={projection.applyMonthlyIncome ? <Money value={projection.effectiveMonthlyContribution} compact signed tone="auto" /> : g.status.excluded}
          hint={
            projection.applyMonthlyIncome
              ? g.workspace.kpi.shareHint({
                  pct: formatPercent(projection.monthlyShare * 100, { maximumFractionDigits: 0 }),
                  rest: projection.pastDue
                    ? g.workspace.kpi.datePassedLower
                    : g.workspace.kpi.monthsLeftInline({ months: formatMonths(projection.monthsToTarget) }),
                })
              : projection.pastDue
                ? g.status.datePassed
                : g.workspace.kpi.monthsLeft({ months: formatMonths(projection.monthsToTarget) })
          }
        />
      </StatGrid>

      <Callout tone={goalProjectionNoteTone(projection.note)}>{describeGoalProjectionNote(projection.note, (n) => formatMoney(n), t.domain.projectionNote)}</Callout>

      {projection.applyMonthlyIncome ? (
        <ProjectionCard
          targetAmount={draft.targetAmount}
          startingAmount={startingBalance}
          monthlyNetContribution={projection.effectiveMonthlyContribution}
          monthsToTarget={projection.monthsToTarget}
          targetDateIso={draft.targetDate}
          checkpoints={draft.checkpoints ?? []}
          annualReturn={projection.annualReturn}
        />
      ) : (
        <StartingOnlyCard startingBalance={startingBalance} targetAmount={draft.targetAmount} />
      )}

      <div className="grid gap-4 md:gap-6 2xl:grid-cols-2">
        <StartingBalancesCard
          draft={draft}
          savedPlans={goals.profiles}
          seedOptions={seedOptions}
          total={startingBalance}
          onApply={(seedLines) => save({ ...draft, seedLines }, isComposingNew ? g.workspace.toasts.planCreated : g.workspace.toasts.startingSaved)}
        />
        <CheckpointsCard
          checkpoints={draft.checkpoints ?? []}
          onApply={(checkpoints) => save({ ...draft, checkpoints }, isComposingNew ? g.workspace.toasts.planCreated : g.workspace.toasts.checkpointsSaved)}
          onTogglePaid={(id, paid) =>
            save({ ...draft, checkpoints: setCheckpointPaid(draft.checkpoints ?? [], id, paid) }, paid ? g.workspace.toasts.markedPaid : g.workspace.toasts.markedUnpaid)
          }
        />
      </div>

      <div className="grid gap-4 md:gap-6 2xl:grid-cols-2">
        {isComposingNew ? null : details}
        <BreakdownCard projection={projection} incomeMonthly={incomeMonthly} startingBalance={startingBalance} targetAmount={draft.targetAmount} />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={g.workspace.deleteDialog.title}
        description={g.workspace.deleteDialog.description({ name: savedProfile.name || t.common.untitledPlan })}
        onConfirm={() => {
          deletePlan(savedProfile.id);
          toast.success(g.workspace.toasts.planDeleted, { description: savedProfile.name });
        }}
      />
    </div>
  );
}
