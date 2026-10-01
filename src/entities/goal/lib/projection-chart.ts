import type { GoalCheckpoint } from "@/entities/goal/model";
import { cumulativeDueScheduleFromCheckpoints } from "@/entities/goal/lib/checkpoints";
import {
  AVG_MONTH_MS,
  fractionalMonthsBetween,
  localDay,
  parseIsoDay,
  startOfMonth,
  toIsoDay,
} from "@/shared/lib/date";

export type ProjectedMeetTarget =
  | { kind: "none" }
  | { kind: "already"; date: Date }
  | { kind: "unreachable" }
  | { kind: "date"; date: Date; months: number };

/** When the linear projection first reaches the target. */
export function computeProjectedMeetTarget(
  today: Date,
  startingAmount: number,
  monthlyNetContribution: number,
  targetAmount: number,
): ProjectedMeetTarget {
  if (targetAmount <= 0) return { kind: "none" };
  if (startingAmount >= targetAmount) {
    return { kind: "already", date: localDay(today) };
  }
  if (monthlyNetContribution <= 0) return { kind: "unreachable" };

  const monthsNeeded = (targetAmount - startingAmount) / monthlyNetContribution;
  const meet = new Date(today.getTime() + monthsNeeded * AVG_MONTH_MS);
  return { kind: "date", date: localDay(meet), months: monthsNeeded };
}

/**
 * X-axis columns: month starts from this month through the goal month, the goal
 * day itself, and checkpoint days in range. Without a goal date, `monthsToTarget`
 * month starts are used.
 */
export function buildAxisColumnDates(
  today: Date,
  targetDateIso: string | undefined,
  checkpointList: GoalCheckpoint[],
  monthsToTarget: number,
): Date[] {
  const todayDay = localDay(today);
  const first = startOfMonth(todayDay);
  const goal = targetDateIso ? parseIsoDay(targetDateIso) : null;
  const seen = new Set<string>();
  const out: Date[] = [];

  function push(d: Date) {
    const ld = localDay(d);
    const k = toIsoDay(ld);
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
      const cd = parseIsoDay(c.date);
      if (!cd) continue;
      const cpDay = localDay(cd);
      if (cpDay.getTime() < first.getTime()) continue;
      if (cpDay.getTime() > goalDay.getTime()) continue;
      push(cpDay);
    }
  } else {
    for (let m = 1; m <= Math.max(1, monthsToTarget); m++) {
      push(new Date(first.getFullYear(), first.getMonth() + m, 1));
    }
    for (const c of checkpointList) {
      const cd = parseIsoDay(c.date);
      if (!cd) continue;
      const cpDay = localDay(cd);
      if (cpDay.getTime() < first.getTime()) continue;
      push(cpDay);
    }
  }

  out.sort((a, b) => a.getTime() - b.getTime());
  if (out.length === 0) out.push(localDay(today));
  return out;
}

export function cumulativeDueAtOrBefore(
  tickDate: Date,
  schedule: { date: Date; cumulative: number }[],
): number {
  let v = 0;
  for (const s of schedule) {
    if (s.date.getTime() <= tickDate.getTime()) v = Math.max(v, s.cumulative);
  }
  return v;
}

export type PaidCheckpointDot = {
  id: string;
  /** Local-midnight timestamp of the checkpoint day. */
  x: number;
  /** Cumulative installments after this payment. */
  cumulative: number;
};

/** Paid checkpoints plotted at their running cumulative total. */
export function paidCheckpointDots(checkpoints: GoalCheckpoint[]): PaidCheckpointDot[] {
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
    const d = parseIsoDay(c.date);
    if (!d) continue;
    out.push({ id: c.id, x: localDay(d).getTime(), cumulative: running });
  }
  return out;
}

export type ProjectionChartRow = {
  /** Local-midnight timestamp. */
  x: number;
  projected: number;
  due: number | null;
  target: number;
};

export type ProjectionChartModel = {
  rows: ProjectionChartRow[];
  hasSchedule: boolean;
  paidDots: PaidCheckpointDot[];
  meetTarget: ProjectedMeetTarget;
  /** Projection reaches the target only after the goal date. */
  afterGoalDate: boolean;
  goalDate: Date | null;
};

export type ProjectionChartInput = {
  today?: Date;
  targetAmount: number;
  startingAmount: number;
  monthlyNetContribution: number;
  monthsToTarget: number;
  targetDateIso?: string;
  checkpoints: GoalCheckpoint[];
};

/** Everything the Goal Plan projection chart renders, as plain data. */
export function buildProjectionChartModel(input: ProjectionChartInput): ProjectionChartModel {
  const today = localDay(input.today ?? new Date());
  const {
    targetAmount,
    startingAmount,
    monthlyNetContribution,
    monthsToTarget,
    targetDateIso,
    checkpoints,
  } = input;

  const schedule = cumulativeDueScheduleFromCheckpoints(checkpoints);
  const hasSchedule = schedule.length > 0;
  const paidDots = paidCheckpointDots(checkpoints);
  const meetTarget = computeProjectedMeetTarget(
    today,
    startingAmount,
    monthlyNetContribution,
    targetAmount,
  );

  let axisDates = buildAxisColumnDates(today, targetDateIso, checkpoints, monthsToTarget);

  if (meetTarget.kind === "date") {
    const extra: Date[] = [meetTarget.date];
    const lastAxis = axisDates[axisDates.length - 1];
    if (lastAxis && meetTarget.date.getTime() > lastAxis.getTime()) {
      const cursor = startOfMonth(new Date(lastAxis.getFullYear(), lastAxis.getMonth() + 1, 1));
      while (cursor.getTime() < meetTarget.date.getTime()) {
        extra.push(new Date(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }
    const seen = new Set<string>();
    axisDates = [...axisDates, ...extra]
      .map(localDay)
      .filter((d) => {
        const k = toIsoDay(d);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .sort((a, b) => a.getTime() - b.getTime());
  }

  const parsedGoal = targetDateIso ? parseIsoDay(targetDateIso) : null;
  const goalDate = parsedGoal ? localDay(parsedGoal) : null;
  const afterGoalDate =
    goalDate !== null &&
    meetTarget.kind === "date" &&
    meetTarget.date.getTime() > goalDate.getTime();

  const rows: ProjectionChartRow[] = axisDates.map((d) => {
    const months = fractionalMonthsBetween(today, d);
    const projected = startingAmount + monthlyNetContribution * months;
    const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    const due = hasSchedule ? cumulativeDueAtOrBefore(endOfDay, schedule) : null;
    return { x: d.getTime(), projected, due, target: targetAmount };
  });

  return { rows, hasSchedule, paidDots, meetTarget, afterGoalDate, goalDate };
}
