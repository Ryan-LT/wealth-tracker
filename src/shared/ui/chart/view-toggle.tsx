"use client";

import { BarChart3, Table2 } from "lucide-react";

import { SegmentedControl } from "@/shared/ui/segmented-control";

export type ChartView = "chart" | "table";

/** Every chart offers a table view so no value is only reachable by hovering. */
export function ChartViewToggle({ value, onChange }: { value: ChartView; onChange: (v: ChartView) => void }) {
  return (
    <SegmentedControl<ChartView>
      aria-label="Chart or table view"
      value={value}
      onValueChange={onChange}
      className="[&_[data-slot=tabs-trigger]]:px-2"
      options={[
        { value: "chart", label: "Chart", icon: BarChart3 },
        { value: "table", label: "Table", icon: Table2 },
      ]}
    />
  );
}
