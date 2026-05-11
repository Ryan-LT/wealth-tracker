"use client";

import type { ChartOptions } from "chart.js";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

import { formatThousands, formatVnd } from "@/shared/lib";
import { registerChartJs } from "@/shared/lib/chart/registerChartJs";
import { Card } from "@/shared/ui";

registerChartJs();

type ProjectionTimelineChartProps = {
  targetAmount: number;
  startingAmount: number;
  /** Total monthly income applied toward the goal each month (₫). */
  monthlyIncome: number;
  /** Whole months from today to the goal date (minimum 1). */
  monthsToTarget: number;
  /** Goal date `YYYY-MM-DD`; used for the last axis label when valid. */
  targetDateIso?: string;
};

function atLocalDate(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatChartAxisDate(d: Date): string {
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseGoalDateLocal(iso: string): Date | null {
  const day = iso.trim().split("T")[0];
  const d = new Date(`${day}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function labelForMonthTick(
  t: number,
  monthsToTarget: number,
  targetDateIso: string | undefined,
  startAnchor: Date,
): string {
  const goal = targetDateIso ? parseGoalDateLocal(targetDateIso) : null;
  if (t >= monthsToTarget && goal) {
    return formatChartAxisDate(goal);
  }
  const d = new Date(
    startAnchor.getFullYear(),
    startAnchor.getMonth() + t,
    startAnchor.getDate(),
  );
  return formatChartAxisDate(d);
}

function sampleMonthTicks(months: number, maxPoints: number): number[] {
  const m = Math.max(1, months);
  if (m <= maxPoints) {
    return Array.from({ length: m + 1 }, (_, i) => i);
  }
  const n = maxPoints;
  return Array.from({ length: n }, (_, i) => Math.round((i / (n - 1)) * m));
}

export function ProjectionTimelineChart({
  targetAmount,
  startingAmount,
  monthlyIncome,
  monthsToTarget,
  targetDateIso,
}: ProjectionTimelineChartProps) {
  const { chartData, options } = useMemo(() => {
    const startAnchor = atLocalDate(new Date());
    const ticks = sampleMonthTicks(monthsToTarget, 6);
    const labels = ticks.map((t) =>
      labelForMonthTick(t, monthsToTarget, targetDateIso, startAnchor),
    );
    const projected = ticks.map((t) => startingAmount + monthlyIncome * t);

    const data = {
      labels,
      datasets: [
        {
          label: "Projected balance",
          data: projected,
          fill: true,
          borderColor: "#006c49",
          backgroundColor: "rgba(108, 248, 187, 0.35)",
          tension: 0.15,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: "Target",
          data: labels.map(() => targetAmount),
          borderColor: "rgba(176, 42, 42, 0.75)",
          borderDash: [6, 6],
          fill: false,
          pointRadius: 0,
          tension: 0,
        },
      ],
    };

    const chartOptions: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: { boxWidth: 12, font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const y = ctx.parsed.y;
              if (y == null) return "";
              if (ctx.datasetIndex === 1) {
                return `Target: ${formatVnd(targetAmount)}`;
              }
              return formatVnd(y);
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxRotation: 45, minRotation: 0, font: { size: 11 } },
        },
        y: {
          grid: { color: "rgba(0, 0, 0, 0.06)" },
          ticks: {
            callback: (value) => formatThousands(Number(value)),
          },
        },
      },
    };

    return { chartData: data, options: chartOptions };
  }, [
    targetAmount,
    startingAmount,
    monthlyIncome,
    monthsToTarget,
    targetDateIso,
  ]);

  return (
    <Card className="p-stack-md grow">
      <h3 className="text-headline-md font-headline-md text-on-surface border-b border-outline-variant pb-2 mb-4">
        Projection (linear)
      </h3>
      <p className="text-body-sm font-body-md text-on-surface-variant mb-3">
        {monthlyIncome > 0
          ? "Uses your allocated starting amounts plus the monthly income amount above each month until the goal date."
          : "Uses only your allocated starting amounts — flat line until the goal date (monthly income is off for this plan)."}
      </p>
      <div className="relative w-full h-64 rounded border border-outline-variant bg-surface-container-low overflow-hidden">
        <span className="absolute top-3 right-3 z-10 text-label-sm font-label-sm text-error bg-surface-container-lowest px-1 rounded">
          Target: {formatVnd(targetAmount)}
        </span>
        <Line data={chartData} options={options} />
      </div>
    </Card>
  );
}
