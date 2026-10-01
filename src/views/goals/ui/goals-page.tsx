"use client";

import { Plus } from "lucide-react";

import { useCreateParam } from "@/shared/lib/use-create-param";
import { Button } from "@/shared/ui/kit/button";
import { PageHeader } from "@/shared/ui/page-header";
import { PageContainer } from "@/widgets/app-shell";

import { useGoalPlanEditor } from "../model/use-goal-plan-editor";
import { PlanList, PlanSwitcher } from "./plan-list";
import { PlanWorkspace } from "./plan-workspace";

export function GoalsPage() {
  const editor = useGoalPlanEditor();
  const { goals, seedOptions, householdMonthlyNet, isComposingNew, selectPlan, startNewPlan, savedProfile } = editor;
  useCreateParam(startNewPlan);

  const listProps = {
    goals,
    seedOptions,
    monthlyNet: householdMonthlyNet,
    activeId: savedProfile.id,
    isComposingNew,
    onSelect: selectPlan,
    onNew: startNewPlan,
  };

  return (
    <PageContainer>
      <PageHeader
        title="Goals"
        description="Set targets, fund them from your assets, and see when you'll get there."
        actions={
          <Button onClick={startNewPlan} disabled={isComposingNew}>
            <Plus />
            New plan
          </Button>
        }
      />
      <div className="lg:hidden">
        <PlanSwitcher {...listProps} />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="sticky top-20 hidden lg:block" aria-label="Goal plans">
          <PlanList {...listProps} />
        </aside>
        <PlanWorkspace key={goals.activeProfileId || savedProfile.id || "new"} editor={editor} />
      </div>
    </PageContainer>
  );
}
