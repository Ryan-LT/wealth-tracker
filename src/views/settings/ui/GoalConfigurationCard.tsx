"use client";

import { Button, MaterialIcon } from "@/shared/ui";

type GoalConfigurationCardProps = {
  primaryTarget: number;
  targetDate: string;
  onPrimaryTargetChange: (next: number) => void;
  onTargetDateChange: (next: string) => void;
};

export function GoalConfigurationCard({
  primaryTarget,
  targetDate,
  onPrimaryTargetChange,
  onTargetDateChange,
}: GoalConfigurationCardProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg">
      <div className="p-stack-md border-b border-outline-variant bg-surface rounded-t-lg">
        <div className="flex items-center gap-stack-sm">
          <MaterialIcon name="insights" filled className="text-primary" />
          <h2 className="font-headline-md text-headline-md text-primary">Goal Configuration</h2>
        </div>
      </div>
      <div className="p-stack-md flex flex-col gap-stack-md">
        <div>
          <label
            htmlFor="primary-target"
            className="block font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase"
          >
            Primary Target (₫)
          </label>
          <input
            id="primary-target"
            type="text"
            inputMode="numeric"
            value={primaryTarget.toLocaleString("en-US")}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, "");
              onPrimaryTargetChange(digits === "" ? 0 : Number(digits));
            }}
            className="w-full bg-surface-bright border border-outline-variant text-primary font-data-tabular text-data-tabular rounded p-2 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="target-date"
            className="block font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase"
          >
            Target Date
          </label>
          <input
            id="target-date"
            type="date"
            value={targetDate}
            onChange={(e) => onTargetDateChange(e.target.value)}
            className="w-full bg-surface-bright border border-outline-variant text-primary font-body-md text-body-md rounded p-2 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
          />
        </div>
        <Button variant="secondary" block className="mt-2">
          Manage Simulation Profiles
        </Button>
      </div>
    </section>
  );
}
