"use client";

import type { ChartData, ChartOptions, Plugin } from "chart.js";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

import {
  cumulativeDueScheduleFromCheckpoints,
  formatThousands,
  formatVnd,
} from "@/shared/lib";
import { registerChartJs } from "@/shared/lib/chart/register-chart-js";
import type { GoalCheckpoint } from "@/shared/storage";
import { Card } from "@/shared/ui";

registerChartJs();

const MS_PER_AVG_MONTH = (1000 * 60 * 60 * 24 * 365.25) / 12;

type ProjectionTimelineChartProps = {
  targetAmount: number;
  startingAmount: number;
  /** Total monthly income applied toward the goal each month (₫). */
  monthlyIncome: number;
  /** Whole months from today to the goal date (minimum 1). */
  monthsToTarget: number;
  /** Goal date `YYYY-MM-DD`; used for the last axis label when valid. */
  targetDateIso?: string;
  /** Installment checkpoints; chart cumulates `amount` by date. */
  checkpoints?: GoalCheckpoint[];
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

/** Local calendar day at midnight (for keys and comparisons). */
function localDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function isFirstOfMonthLocal(d: Date): boolean {
  return d.getDate() === 1;
}

/** Month-start ticks show short month + year; specific days show DD/MM/YYYY. */
function formatXAxisLabel(d: Date): string {
  if (Number.isNaN(d.getTime())) return "—";
  if (isFirstOfMonthLocal(d)) {
    return d.toLocaleString(undefined, { month: "short", year: "numeric" });
  }
  return formatChartAxisDate(d);
}

function fractionalMonthsBetween(anchor: Date, end: Date): number {
  return Math.max(0, (end.getTime() - anchor.getTime()) / MS_PER_AVG_MONTH);
}

function cumulativeDueAtOrBefore(
  tickDate: Date,
  schedule: { date: Date; cumulative: number }[],
): number {
  let v = 0;
  for (const s of schedule) {
    if (s.date.getTime() <= tickDate.getTime()) v = Math.max(v, s.cumulative);
  }
  return v;
}

/**
 * X columns: start of **this** month, then each following month start through the goal month,
 * plus the **exact target date**, plus every **checkpoint** date (deduped, sorted).
 * When there is no goal date, uses `monthsToTarget` month starts from “this month”.
 */
function buildAxisColumnDates(
  today: Date,
  targetDateIso: string | undefined,
  checkpointList: GoalCheckpoint[],
  monthsToTarget: number,
): Date[] {
  const todayDay = localDay(today);
  const first = startOfMonth(todayDay);
  const goal = targetDateIso ? parseGoalDateLocal(targetDateIso) : null;
  const seen = new Set<string>();
  const out: Date[] = [];

  function push(d: Date) {
    const ld = localDay(d);
    const k = dayKey(ld);
    if (seen.has(k)) return;
    seen.add(k);
    out.push(ld);
  }

  push(first);

  if (goal) {
    const goalDay = localDay(goal);
    const goalMonthStart = startOfMonth(goalDay);
    const cur = new Date(first.getFullYear(), first.getMonth() + 1, 1);
    while (cur.getTime() <= goalMonthStart.getTime()) {
      push(cur);
      cur.setMonth(cur.getMonth() + 1);
    }
    push(goalDay);

    for (const c of checkpointList) {
      const cd = parseGoalDateLocal(c.date);
      if (!cd) continue;
      const cpDay = localDay(cd);
      if (cpDay.getTime() < first.getTime()) continue;
      if (cpDay.getTime() > goalDay.getTime()) continue;
      push(cpDay);
    }
  } else {
    for (let m = 1; m <= Math.max(1, monthsToTarget); m++) {
      const d = new Date(first.getFullYear(), first.getMonth() + m, 1);
      push(d);
    }
    for (const c of checkpointList) {
      const cd = parseGoalDateLocal(c.date);
      if (!cd) continue;
      const cpDay = localDay(cd);
      if (cpDay.getTime() < first.getTime()) continue;
      push(cpDay);
    }
  }

  out.sort((a, b) => a.getTime() - b.getTime());
  if (out.length === 0) {
    out.push(localDay(today));
  }
  return out;
}

export function ProjectionTimelineChart({
  targetAmount,
  startingAmount,
  monthlyIncome,
  monthsToTarget,
  targetDateIso,
  checkpoints = [],
}: ProjectionTimelineChartProps) {
  const { chartData, options, plugins } = useMemo(() => {
    const today = atLocalDate(new Date());
    const schedule = cumulativeDueScheduleFromCheckpoints(checkpoints);
    const hasSchedule = schedule.length > 0;
    const parsedGoal = targetDateIso ? parseGoalDateLocal(targetDateIso) : null;
    const goalDay = parsedGoal ? localDay(parsedGoal) : null;

    const axisDates = buildAxisColumnDates(
      today,
      targetDateIso,
      checkpoints,
      monthsToTarget,
    );

    const checkpointOnlyKeys = new Set(
      checkpoints
        .map((c) => parseGoalDateLocal(c.date))
        .filter((d): d is Date => d != null)
        .map((d) => dayKey(localDay(d))),
    );
    const milestoneDayKeys = new Set(checkpointOnlyKeys);
    if (goalDay) milestoneDayKeys.add(dayKey(goalDay));

    const labels = axisDates.map((d) => {
      const k = dayKey(d);
      if (goalDay && k === dayKey(goalDay)) return formatChartAxisDate(d);
      if (checkpointOnlyKeys.has(k)) return formatChartAxisDate(d);
      return formatXAxisLabel(d);
    });

    const projected = axisDates.map((d) => {
      const months = fractionalMonthsBetween(today, d);
      return startingAmount + monthlyIncome * months;
    });

    const dueSeries = hasSchedule
      ? axisDates.map((d) => {
          const endOfDay = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            23,
            59,
            59,
            999,
          );
          return cumulativeDueAtOrBefore(endOfDay, schedule);
        })
      : axisDates.map(() => 0);

    const xMs = axisDates.map((d) => d.getTime());
    const xTickLabel = new Map<number, string>(
      axisDates.map((d, i) => [d.getTime(), labels[i]!]),
    );

    const toXY = (ys: number[]) =>
      axisDates.map((d, i) => ({
        x: d.getTime(),
        y: ys[i]!,
      }));

    const xTickPlugin: Plugin<"line"> = {
      id: "projectionTimelineXAxisTicks",
      afterBuildTicks(_chart, args) {
        const scale = args.scale;
        if (scale.id !== "x") return;
        scale.ticks = xMs.map((value) => ({ value }));
      },
    };

    const pointRadiusForIndex = (i: number) => {
      const k = dayKey(axisDates[i]!);
      const isMilestone = milestoneDayKeys.has(k);
      const sparse = axisDates.length > 36;
      if (isMilestone) return 6;
      return sparse ? 0 : 2;
    };

    const projectedXY = toXY(projected);
    const dueXY = toXY(dueSeries);
    const targetXY = toXY(projected.map(() => targetAmount));

    const datasets = [
      {
        label: "Projected balance",
        data: projectedXY,
        fill: true,
        borderColor: "#006c49",
        backgroundColor: "rgba(108, 248, 187, 0.35)",
        tension: 0.15,
        borderWidth: 2,
        pointRadius: axisDates.map((_, i) => pointRadiusForIndex(i)),
        pointHoverRadius: 7,
      },
      ...(hasSchedule
        ? [
            {
              label: "Cumulative due by date",
              data: dueXY,
              fill: false,
              borderColor: "rgba(180, 83, 9, 0.95)",
              backgroundColor: "transparent",
              stepped: "after" as const,
              tension: 0,
              borderWidth: 2,
              pointRadius: axisDates.map((_, i) => pointRadiusForIndex(i)),
              pointHoverRadius: 7,
              pointBackgroundColor: "rgba(180, 83, 9, 1)",
            },
          ]
        : []),
      {
        label: "Target",
        data: targetXY,
        borderColor: "rgba(176, 42, 42, 0.75)",
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
        tension: 0,
      },
    ];

    const data: ChartData<"line", { x: number; y: number }[]> = {
      datasets,
    };

    const chartOptions: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: { boxWidth: 12, font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const x = items[0]?.parsed.x;
              if (x == null || typeof x !== "number") return "";
              return formatChartAxisDate(new Date(x));
            },
            label: (ctx) => {
              const y = ctx.parsed.y;
              if (y == null) return "";
              const label = ctx.chart.data.datasets[ctx.datasetIndex]?.label;
              if (label === "Target") {
                return `Target: ${formatVnd(targetAmount)}`;
              }
              if (label === "Cumulative due by date") {
                return `Due by then (cumulative): ${formatVnd(y)}`;
              }
              const i = ctx.dataIndex;
              const proj = projected[i] ?? 0;
              let s = `Projected: ${formatVnd(proj)}`;
              if (hasSchedule) {
                const due = dueSeries[i] ?? 0;
                if (due > 0) {
                  const gap = proj - due;
                  s +=
                    gap >= 0
                      ? ` — ${formatVnd(gap)} above due`
                      : ` — ${formatVnd(-gap)} below due`;
                }
              }
              return s;
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          min: xMs[0],
          max: xMs[xMs.length - 1],
          grid: { display: false },
          ticks: {
            maxRotation: 45,
            minRotation: 0,
            font: { size: 11 },
            autoSkip: false,
            callback: (raw) => {
              const v = typeof raw === "number" ? raw : Number(raw);
              return xTickLabel.get(v) ?? "";
            },
          },
        },
        y: {
          grid: { color: "rgba(0, 0, 0, 0.06)" },
          ticks: {
            callback: (value) => formatThousands(Number(value)),
          },
        },
      },
    };

    return { chartData: data, options: chartOptions, plugins: [xTickPlugin] };
  }, [
    targetAmount,
    startingAmount,
    monthlyIncome,
    monthsToTarget,
    targetDateIso,
    checkpoints,
  ]);

  return (
    <Card className="flex w-full flex-col p-stack-md">
      <h3 className="text-headline-md font-headline-md text-on-surface border-b border-outline-variant pb-2 mb-3">
        Projection (linear)
      </h3>
      <p className="mb-2 text-label-sm text-on-surface-variant">
        X: month starts from this month, checkpoint / goal days when needed;
        hover for full date.
      </p>
      <div className="relative h-64 w-full rounded border border-outline-variant bg-surface-container-low overflow-hidden sm:h-72">
        <span className="absolute top-3 right-3 z-10 text-label-sm font-label-sm text-error bg-surface-container-lowest px-1 rounded">
          Target: {formatVnd(targetAmount)}
        </span>
        <Line data={chartData} options={options} plugins={plugins} />
      </div>
    </Card>
  );
}
