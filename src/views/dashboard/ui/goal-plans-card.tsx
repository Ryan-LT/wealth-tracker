"use client";

import { ChevronRight, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { computeGoalFeasibility, goalProgressPercent, type GoalPlanSummary } from "@/entities/goal";
import { FeasibilityBadge } from "@/entities/goal/ui";
import { useI18n } from "@/shared/i18n";
import { formatDate } from "@/shared/lib/format";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/kit/button";
import { Progress } from "@/shared/ui/kit/progress";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";

type GoalPlansCardProps = {
  plans: GoalPlanSummary[];
  monthlyNet: number;
  onOpenPlan: (planId: string) => void;
};

export function GoalPlansCard({ plans, monthlyNet, onOpenPlan }: GoalPlansCardProps) {
  const router = useRouter();
  const { t } = useI18n();
  const m = t.dashboard.goalPlans;
  const hasRealPlans = plans.some((p) => p.planId);

  return (
    <Section
      title={m.title}
      description={m.description}
      actions={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/goals">
            {m.viewAll}
            <ChevronRight />
          </Link>
        </Button>
      }
      flush
    >
      {plans.length === 0 || (!hasRealPlans && plans[0].targetAmount <= 0) ? (
        <EmptyState
          icon={Target}
          title={m.emptyTitle}
          description={m.emptyDescription}
          action={
            <Button variant="outline" asChild>
              <Link href="/goals?new=1">{m.createPlan}</Link>
            </Button>
          }
        />
      ) : (
        <ul className="divide-y">
          {plans.map((plan) => {
            const pct = goalProgressPercent(plan.saved, plan.targetAmount);
            const health = computeGoalFeasibility({
              saved: plan.saved,
              targetAmount: plan.targetAmount,
              targetDateIso: plan.targetDate,
              includeMonthlyIncome: plan.includeMonthlyIncome,
              // Only this plan's share of the monthly savings (never the whole amount per plan).
              estimatedMonthlyNet: monthlyNet * plan.monthlyShare,
              expectedReturnPct: plan.expectedReturnPct,
            });
            return (
              <li key={plan.key}>
                <button
                  type="button"
                  className="grid w-full gap-2 px-5 py-3.5 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                  onClick={() => {
                    if (plan.planId) onOpenPlan(plan.planId);
                    router.push("/goals");
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate font-medium">{plan.name}</span>
                    <FeasibilityBadge tone={health.tone} code={health.code} interactive={false} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={pct} className="flex-1" />
                    <span className="w-10 text-right text-xs font-medium tabular-nums">{pct}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Money value={plan.saved} compact interactive={false} className="font-medium text-foreground" />{" "}
                    {plan.savedCaption === "Saved" ? m.captionSaved : m.captionAllocated} {m.of}{" "}
                    <Money value={plan.targetAmount} compact interactive={false} />
                    {plan.targetDate ? m.byDate({ date: formatDate(plan.targetDate) }) : ""}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
