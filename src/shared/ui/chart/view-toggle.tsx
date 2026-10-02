"use client";

import { BarChart3, Table2 } from "lucide-react";

import { useI18n } from "@/shared/i18n";
import { SegmentedControl } from "@/shared/ui/segmented-control";

export type ChartView = "chart" | "table";

/** Every chart offers a table view so no value is only reachable by hovering. */
export function ChartViewToggle({ value, onChange }: { value: ChartView; onChange: (v: ChartView) => void }) {
  const { t } = useI18n();
  return (
    <SegmentedControl<ChartView>
      aria-label={t.shell.ui.chartOrTable}
      value={value}
      onValueChange={onChange}
      className="[&_[data-slot=tabs-trigger]]:px-2"
      options={[
        { value: "chart", label: t.common.chart, icon: BarChart3 },
        { value: "table", label: t.common.table, icon: Table2 },
      ]}
    />
  );
}
