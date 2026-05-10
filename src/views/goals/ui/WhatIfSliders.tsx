"use client";

import { formatVnd } from "@/shared/lib";
import { Card, RangeSlider } from "@/shared/ui";

type WhatIfSlidersProps = {
  monthlyContribution: number;
  onMonthlyContributionChange: (next: number) => void;
  timelineShiftMonths: number;
  onTimelineShiftChange: (next: number) => void;
};

export function WhatIfSliders({
  monthlyContribution,
  onMonthlyContributionChange,
  timelineShiftMonths,
  onTimelineShiftChange,
}: WhatIfSlidersProps) {
  return (
    <Card className="p-stack-md">
      <h3 className="text-headline-md font-headline-md text-on-surface border-b border-outline-variant pb-2 mb-4">
        What-If Scenarios
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
        <RangeSlider
          label="Monthly Contribution"
          value={monthlyContribution}
          onChange={onMonthlyContributionChange}
          min={1_000_000}
          max={100_000_000}
          step={250_000}
          format={(v) => formatVnd(v)}
          minLabel="1M ₫"
          maxLabel="100M ₫"
        />
        <RangeSlider
          label="Timeline Shift (months)"
          value={timelineShiftMonths}
          onChange={onTimelineShiftChange}
          min={-12}
          max={24}
          step={1}
          format={(v) => `${v >= 0 ? "+" : ""}${v} mo`}
          minLabel="-12 mo"
          maxLabel="+24 mo"
        />
      </div>
    </Card>
  );
}
