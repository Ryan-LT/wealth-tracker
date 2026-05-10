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
  /**
   * Position of the "today" amount expressed as a fraction of target (0..1).
   * The chart adapts its curve subtly based on this value.
   */
  progress: number;
};

/** SVG-space Y (0 = top, 100 = bottom), matching the prior bezier control layout. */
function svgYAt(
  x: number,
  startY: number,
  midY: number,
  endY: number,
): number {
  if (x <= 50) {
    const t = x / 50;
    return (1 - t) ** 2 * startY + 2 * (1 - t) * t * midY + t ** 2 * 50;
  }
  const t = (x - 50) / 50;
  const cy = 100 - midY;
  return (1 - t) ** 2 * 50 + 2 * (1 - t) * t * cy + t ** 2 * endY;
}

export function ProjectionTimelineChart({
  targetAmount,
  progress,
}: ProjectionTimelineChartProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const startY = 100 - clamped * 30;
  const midY = 75 - clamped * 35;
  const endY = 10 + (1 - clamped) * 5;

  const { chartData, options } = useMemo(() => {
    const xs = [0, 25, 50, 75, 100];
    const labels = ["Today", "Year 1", "Year 2", "Year 3", "Target"];
    const projected = xs.map((x) => {
      const svgY = svgYAt(x, startY, midY, endY);
      return (targetAmount * (100 - svgY)) / 100;
    });

    const data = {
      labels,
      datasets: [
        {
          label: "Projected balance",
          data: projected,
          fill: true,
          borderColor: "#006c49",
          backgroundColor: "rgba(108, 248, 187, 0.35)",
          tension: 0.35,
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
          ticks: { maxRotation: 0, font: { size: 11 } },
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
  }, [targetAmount, startY, midY, endY]);

  return (
    <Card className="p-stack-md grow">
      <h3 className="text-headline-md font-headline-md text-on-surface border-b border-outline-variant pb-2 mb-4">
        Projection Timeline
      </h3>
      <div className="relative w-full h-64 rounded border border-outline-variant bg-surface-container-low overflow-hidden">
        <span className="absolute top-3 right-3 z-10 text-label-sm font-label-sm text-error bg-surface-container-lowest px-1 rounded">
          Target: {formatVnd(targetAmount)}
        </span>
        <Line data={chartData} options={options} />
      </div>
      <div className="flex justify-between mt-2 text-label-sm font-label-sm text-on-surface-variant px-2">
        <span>Today</span>
        <span>Year 1</span>
        <span>Year 2</span>
        <span>Year 3</span>
        <span>Target</span>
      </div>
    </Card>
  );
}
