"use client";

import type { GoalProfile } from "@/shared/storage";
import { Button, Card, MoneyInput } from "@/shared/ui";

type GoalCreatorFormProps = {
  profile: GoalProfile;
  onChange: (next: GoalProfile) => void;
  onSimulate: () => void;
  onSave: () => void;
};

export function GoalCreatorForm({
  profile,
  onChange,
  onSimulate,
  onSave,
}: GoalCreatorFormProps) {
  return (
    <Card className="p-stack-md">
      <h3 className="text-headline-md font-headline-md text-on-surface mb-stack-sm border-b border-outline-variant pb-2">
        Goal Creator
      </h3>
      <form
        className="flex flex-col gap-stack-md mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSimulate();
        }}
      >
        <div>
          <label
            htmlFor="goal-name"
            className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider"
          >
            Goal Name
          </label>
          <input
            id="goal-name"
            type="text"
            placeholder="e.g., Vacation Home"
            value={profile.name}
            onChange={(e) => onChange({ ...profile, name: e.target.value })}
            className="w-full bg-surface border border-outline-variant rounded p-2 text-body-md font-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
          />
        </div>

        <MoneyInput
          label="Target Amount (₫)"
          value={profile.targetAmount}
          onChange={(targetAmount) => onChange({ ...profile, targetAmount })}
          placeholder="0"
        />

        <div>
          <label
            htmlFor="goal-target-date"
            className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider"
          >
            Target Date
          </label>
          <input
            id="goal-target-date"
            type="date"
            value={profile.targetDate}
            onChange={(e) => onChange({ ...profile, targetDate: e.target.value })}
            className="w-full bg-surface border border-outline-variant rounded p-2 text-body-md font-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
          />
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Button type="submit" block>
            Simulate Goal
          </Button>
          <Button type="button" variant="outline-secondary" block onClick={onSave}>
            Save Current Setup
          </Button>
        </div>
      </form>
    </Card>
  );
}
