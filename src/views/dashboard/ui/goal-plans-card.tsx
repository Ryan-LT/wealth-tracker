"use client";

import { ChevronRight, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { computeGoalFeasibility, goalProgressPercent, type GoalPlanSummary } from "@/entities/goal";
import { FeasibilityBadge } from "@/entities/goal/ui";
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
  const hasRealPlans = plans.some((p) => p.planId);

  return (
    <Section
      title="Goal plans"
      description="Progress counts allocated starting balances; health compares pace with your monthly net."
      actions={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/goals">
            View all
            <ChevronRight />
          </Link>
        </Button>
      }
      flush
    >
      {plans.length === 0 || (!hasRealPlans && plans[0].targetAmount <= 0) ? (
        <EmptyState
          icon={Target}
          title="No goal plans yet"
          description="Create a plan to see whether your savings pace reaches the target in time."
          action={
            <Button variant="outline" asChild>
              <Link href="/goals?new=1">Create a plan</Link>
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
              estimatedMonthlyNet: monthlyNet,
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
                    <FeasibilityBadge tone={health.tone} label={health.label} hint={health.hint} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={pct} className="flex-1" />
                    <span className="w-10 text-right text-xs font-medium tabular-nums">{pct}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Money value={plan.saved} compact className="font-medium text-foreground" /> {plan.savedCaption.toLowerCase()} of{" "}
                    <Money value={plan.targetAmount} compact />
                    {plan.targetDate ? ` · by ${formatDate(plan.targetDate)}` : ""}
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
