"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  cumulativeDueScheduleFromCheckpoints,
  formatThousands,
  formatVnd,
} from "@/shared/lib";
import type { GoalCheckpoint } from "@/shared/storage";

const MS_PER_AVG_MONTH = (1000 * 60 * 60 * 24 * 365.25) / 12;

type ProjectionTimelineChartProps = {
  targetAmount: number;
  startingAmount: number;
  monthlyIncome: number;
  monthsToTarget: number;
  targetDateIso?: string;
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

type ChartRow = {
  x: number;
  label: string;
  projected: number;
  due: number | null;
  target: number;
};

type PaidCheckpointDot = { id: string; label: string; cumulative: number };

function paidCheckpointDots(checkpoints: GoalCheckpoint[]): PaidCheckpointDot[] {
  const sorted = [...checkpoints]
    .filter((c) => String(c.date).trim())
    .map((c) => ({
      ...c,
      date: String(c.date).trim().split("T")[0],
      amount: Math.max(0, Math.floor(Number(c.amount) || 0)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const out: PaidCheckpointDot[] = [];
  let running = 0;
  for (const c of sorted) {
    running += c.amount;
    if (c.paid !== true) continue;
    const d = parseGoalDateLocal(c.date);
    if (!d) continue;
    out.push({
      id: c.id,
      label: formatXAxisLabel(localDay(d)),
      cumulative: running,
    });
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
  const { rows, hasSchedule, paidDots } = useMemo(() => {
    const today = atLocalDate(new Date());
    const schedule = cumulativeDueScheduleFromCheckpoints(checkpoints);
    const hasSched = schedule.length > 0;
    const paidMarkers = paidCheckpointDots(checkpoints);

    const axisDates = buildAxisColumnDates(
      today,
      targetDateIso,
      checkpoints,
      monthsToTarget,
    );

    const data: ChartRow[] = axisDates.map((d) => {
      const months = fractionalMonthsBetween(today, d);
      const projected = startingAmount + monthlyIncome * months;
      const endOfDay = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        23,
        59,
        59,
        999,
      );
      const due = hasSched ? cumulativeDueAtOrBefore(endOfDay, schedule) : null;
      return {
        x: d.getTime(),
        label: formatXAxisLabel(d),
        projected,
        due,
        target: targetAmount,
      };
    });

    return { rows: data, hasSchedule: hasSched, paidDots: paidMarkers };
  }, [targetAmount, startingAmount, monthlyIncome, monthsToTarget, targetDateIso, checkpoints]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Projection</CardTitle>
        <p className="text-xs text-muted-foreground">
          X: month starts; checkpoint / goal days when needed. Filled dots: paid
          checkpoints (cumulative after that payment).
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative h-72 w-full">
          <span className="absolute right-2 top-2 z-10 rounded bg-card px-1.5 py-0.5 text-xs font-medium text-destructive border border-border">
            Target: {formatVnd(targetAmount)}
          </span>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                fontSize={11}
                interval="preserveStartEnd"
                tickMargin={6}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickFormatter={(v) => formatThousands(Number(v))}
                width={64}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--popover-foreground)",
                }}
                formatter={(value: number, name) => {
                  if (name === "Target") return [formatVnd(targetAmount), name];
                  if (name === "Cumulative due") return [formatVnd(value), name];
                  return [formatVnd(value), name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="projected"
                name="Projected"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              {hasSchedule && (
                <Line
                  type="stepAfter"
                  dataKey="due"
                  name="Cumulative due"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {paidDots.map((p) => (
                <ReferenceDot
                  key={p.id}
                  x={p.label}
                  y={p.cumulative}
                  r={5}
                  fill="var(--chart-1)"
                  stroke="var(--background)"
                  strokeWidth={2}
                  ifOverflow="discard"
                />
              ))}
              <ReferenceLine
                y={targetAmount}
                stroke="var(--destructive)"
                strokeDasharray="6 6"
                ifOverflow="extendDomain"
                label={{ value: "Target", position: "insideTopRight", fontSize: 11, fill: "var(--destructive)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
