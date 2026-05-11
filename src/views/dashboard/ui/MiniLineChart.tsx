"use client";

import type { ChartOptions } from "chart.js";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

import { formatThousands, formatVnd } from "@/shared/lib";
import { registerChartJs } from "@/shared/lib/chart/registerChartJs";

registerChartJs();

type MiniLineChartProps = {
  totalNetWorth: number;
  monthChangePct: number;
  /** When provided (6 points), shows preferences-backed history + live NW. */
  chartLabels?: string[];
  chartValues?: number[];
};

export function MiniLineChart({
  totalNetWorth,
  monthChangePct,
  chartLabels,
  chartValues,
}: MiniLineChartProps) {
  const { labels, values } = useMemo(() => {
    if (chartLabels?.length === 6 && chartValues?.length === 6) {
      return { labels: chartLabels, values: chartValues };
    }

    const monthLabels: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthLabels.push(d.toLocaleString(undefined, { month: "short" }));
    }

    const pct = monthChangePct / 100;
    const hasChange =
      monthChangePct !== 0 &&
      Number.isFinite(totalNetWorth) &&
      Number.isFinite(pct) &&
      pct !== -1;

    const start = hasChange ? totalNetWorth / (1 + pct) : totalNetWorth;
    const points = Array.from({ length: 6 }, (_, i) =>
      hasChange
        ? start + ((totalNetWorth - start) * i) / 5
        : totalNetWorth,
    );

    return { labels: monthLabels, values: points };
  }, [totalNetWorth, monthChangePct, chartLabels, chartValues]);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Net worth",
          data: values,
          fill: true,
          borderColor: "#006c49",
          backgroundColor: "rgba(0, 108, 73, 0.12)",
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    }),
    [labels, values],
  );

  const options = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ctx.parsed.y != null ? formatVnd(ctx.parsed.y) : "",
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { display: false },
        },
        y: {
          grid: { color: "rgba(0, 0, 0, 0.06)" },
          ticks: {
            callback: (value) => formatThousands(Number(value)),
          },
        },
      },
    }),
    [],
  );

  return (
    <div>
      <div
        className="h-48 w-full border-b border-l border-outline-variant bg-surface-container-low/30"
        role="img"
        aria-label="Net worth history"
      >
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-2 flex justify-between px-2 font-data-tabular text-[10px] text-on-surface-variant">
        {labels.map((label, i) => (
          <span key={`${label}-${i}`}>{label}</span>
        ))}
      </div>
    </div>
  );
}
