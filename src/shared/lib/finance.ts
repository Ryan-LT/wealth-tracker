import type { NetWorthMonthSnapshot, Preferences } from "@/shared/storage/preferences";

export function monthCalendarKey(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

/** Fractional average months from `now` through end of calendar year. */
export function fractionalMonthsUntilYearEnd(now: Date = new Date()): number {
  const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  const ms = Math.max(0, yearEnd.getTime() - now.getTime());
  const avgMonthMs = (1000 * 60 * 60 * 24 * 365.25) / 12;
  return ms / avgMonthMs;
}

/**
 * Estimated monthly net cash flow for projections.
 * Uses explicit inflow/outflow from preferences when set; otherwise stored net or income − outflow.
 */
export function estimatedMonthlyNetCashflow(
  prefs: Pick<
    Preferences,
    "monthInflow" | "monthOutflow" | "netMonthIncome"
  >,
  totalMonthlyIncomeFromSources: number,
): number {
  if (prefs.monthInflow !== 0 || prefs.monthOutflow !== 0) {
    return prefs.monthInflow - prefs.monthOutflow;
  }
  if (prefs.netMonthIncome !== 0) {
    return prefs.netMonthIncome;
  }
  return totalMonthlyIncomeFromSources - prefs.monthOutflow;
}

export function projectNetWorthEndOfYear(
  netWorth: number,
  prefs: Pick<
    Preferences,
    "monthInflow" | "monthOutflow" | "netMonthIncome"
  >,
  totalMonthlyIncomeFromSources: number,
): number {
  const monthlyNet = estimatedMonthlyNetCashflow(prefs, totalMonthlyIncomeFromSources);
  const months = fractionalMonthsUntilYearEnd();
  return netWorth + monthlyNet * months;
}

/** MTD % vs baseline stored in preferences (updated via `syncNetWorthTracking`). */
export function monthToDateNetWorthChangePercent(
  prefs: Pick<Preferences, "netWorthMonthBaseline">,
  netWorth: number,
): number {
  const b = prefs.netWorthMonthBaseline;
  if (b === undefined || !Number.isFinite(b) || Math.abs(b) < 1) return 0;
  return ((netWorth - b) / Math.abs(b)) * 100;
}

function upsertMonthHistory(
  prev: NetWorthMonthSnapshot[],
  monthKey: string,
  value: number,
): NetWorthMonthSnapshot[] {
  const rest = prev.filter((h) => h.monthKey !== monthKey);
  const next = [...rest, { monthKey, value }];
  next.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  return next.slice(-6);
}

/**
 * Persist MTD baseline, last known NW, and rolling monthly snapshots for the chart.
 * Call when net worth changes (e.g. dashboard load).
 */
export function syncNetWorthTracking(prefs: Preferences, netWorth: number): Preferences {
  const key = monthCalendarKey(new Date());
  const prevKey = prefs.netWorthMonthKey;

  let baseline: number;
  if (prevKey !== undefined && prevKey !== key) {
    baseline = prefs.lastKnownNetWorth ?? netWorth;
  } else {
    baseline = prefs.netWorthMonthBaseline ?? netWorth;
  }

  const netWorthMonthlyHistory = upsertMonthHistory(
    prefs.netWorthMonthlyHistory ?? [],
    key,
    netWorth,
  );

  return {
    ...prefs,
    netWorthMonthKey: key,
    netWorthMonthBaseline: baseline,
    lastKnownNetWorth: netWorth,
    netWorthMonthlyHistory,
  };
}

/** Six-month sparkline: chronological points; current month uses live `netWorth`. */
export function buildNetWorthChartSeries(
  history: NetWorthMonthSnapshot[],
  netWorth: number,
): { labels: string[]; values: number[] } {
  const now = new Date();
  const labels: string[] = [];
  const values: number[] = [];
  const map = new Map(history.map((h) => [h.monthKey, h.value]));

  const sorted = [...history].sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  let carry = sorted.length > 0 ? sorted[0].value : netWorth;

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mk = monthCalendarKey(d);
    labels.push(d.toLocaleString(undefined, { month: "short" }));
    if (map.has(mk)) carry = map.get(mk)!;
    values.push(i === 0 ? netWorth : carry);
  }

  return { labels, values };
}

