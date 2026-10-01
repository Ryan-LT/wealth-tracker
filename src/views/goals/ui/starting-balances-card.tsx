"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";

import { AllocateSourcesDialog } from "@/features/allocate-sources";
import {
  effectiveGoalSeedLineAmount,
  labelForSeedLine,
  type GoalProfile,
  type GoalSeedLine,
  type GoalStartingOption,
} from "@/entities/goal";
import { CategoryBadge, LiquidityBadge } from "@/entities/settings-asset/ui";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/kit/button";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";

type StartingBalancesCardProps = {
  draft: GoalProfile;
  savedPlans: GoalProfile[];
  seedOptions: GoalStartingOption[];
  total: number;
  onApply: (lines: GoalSeedLine[]) => Promise<void>;
};

export function StartingBalancesCard({ draft, savedPlans, seedOptions, total, onApply }: StartingBalancesCardProps) {
  const [open, setOpen] = useState(false);
  const lines = draft.seedLines ?? [];

  return (
    <Section
      title="Starting balances"
      description="Money already set aside for this plan, capped by what other plans reserve."
      actions={
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Pencil />
          Edit
        </Button>
      }
      flush
    >
      {lines.length === 0 ? (
        <EmptyState
          title="No sources allocated"
          description="Allocate part of your assets to give this plan a head start."
          className="py-8"
          action={
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              <Plus />
              Allocate sources
            </Button>
          }
        />
      ) : (
        <>
          <ul className="divide-y">
            {lines.map((line) => {
              const option = seedOptions.find((o) => o.key === line.sourceKey);
              return (
                <li key={line.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{labelForSeedLine(line, seedOptions)}</p>
                    {option?.category || option?.liquidity ? (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {option.category ? <CategoryBadge category={option.category} /> : null}
                        {option.liquidity ? <LiquidityBadge liquidity={option.liquidity} /> : null}
                      </div>
                    ) : null}
                  </div>
                  <Money value={effectiveGoalSeedLineAmount(line, seedOptions, savedPlans, draft)} className="text-sm font-medium" />
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between gap-3 border-t bg-muted/40 px-5 py-3 text-sm font-medium">
            <span>Combined allocated starting</span>
            <Money value={total} />
          </div>
        </>
      )}

      <AllocateSourcesDialog
        open={open}
        onOpenChange={setOpen}
        title="Starting balances"
        description="Choose how much of each source counts toward this plan. Amounts are capped by what your other plans already reserve."
        profile={draft}
        savedPlans={savedPlans}
        seedOptions={seedOptions}
        applyLabel="Apply to plan"
        onApply={onApply}
      />
    </Section>
  );
}
