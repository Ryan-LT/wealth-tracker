import type { NetWorthMonthSnapshot, Preferences } from "@/entities/preferences/model";

export type SpendingPrefs = Pick<
  Preferences,
  "averageMonthlySpending" | "monthOutflow"
>;

export type CashflowPrefs = Pick<
  Preferences,
  "monthInflow" | "monthOutflow" | "netMonthIncome" | "averageMonthlySpending"
>;

/** Resolved average monthly spending (new field or legacy `monthOutflow`). */
export function resolveAverageMonthlySpending(prefs: SpendingPrefs): number {
  const raw = prefs.averageMonthlySpending ?? prefs.monthOutflow ?? 0;
  return Math.max(0, Number.isFinite(raw) ? raw : 0);
}

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
 * Default: income sources − average monthly spending.
 * Legacy override only when both explicit month inflow and outflow are set (and not
 * using the settings spending field as the outflow source).
 */
export function estimatedMonthlyNetCashflow(
  prefs: CashflowPrefs,
  totalMonthlyIncomeFromSources: number,
): number {
  const spending = resolveAverageMonthlySpending(prefs);
  const usesSettingsSpending =
    prefs.averageMonthlySpending !== undefined &&
    prefs.averageMonthlySpending !== null;

  if (
    !usesSettingsSpending &&
    prefs.monthInflow !== 0 &&
    prefs.monthOutflow !== 0
  ) {
    return prefs.monthInflow - prefs.monthOutflow;
  }
  if (prefs.netMonthIncome !== 0) {
    return prefs.netMonthIncome;
  }
  return totalMonthlyIncomeFromSources - spending;
}

export function projectNetWorthEndOfYear(
  netWorth: number,
  prefs: CashflowPrefs,
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


/** Set average monthly spending and clear the legacy outflow so income − spending math wins. */
export function applyAverageMonthlySpending(prefs: Preferences, amount: number): Preferences {
  const value = Math.max(0, Number.isFinite(amount) ? amount : 0);
  return { ...prefs, averageMonthlySpending: value, monthOutflow: 0 };
}

/** Remember a user-defined asset category (deduplicated). */
export function registerExtraAssetCategory(prefs: Preferences, category: string): Preferences {
  return {
    ...prefs,
    extraAssetCategories: [
      ...new Set([...(prefs.extraAssetCategories ?? []), category.trim()]),
    ],
  };
}

export type NetWorthTrendPoint = {
  /** `YYYY-MM`. */
  monthKey: string;
  /** First day of the month (local). */
  date: Date;
  value: number;
  /** True for the current month (live net worth, not a stored snapshot). */
  live: boolean;
};

/**
 * Last six calendar months for the net-worth chart. Same carry-forward rule as
 * {@link buildNetWorthChartSeries}: months without a snapshot repeat the previous value.
 */
export function buildNetWorthTrend(
  history: NetWorthMonthSnapshot[],
  netWorth: number,
  now: Date = new Date(),
): NetWorthTrendPoint[] {
  const map = new Map(history.map((h) => [h.monthKey, h.value]));
  const sorted = [...history].sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  let carry = sorted.length > 0 ? sorted[0].value : netWorth;
  const out: NetWorthTrendPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = monthCalendarKey(date);
    if (map.has(monthKey)) carry = map.get(monthKey)!;
    out.push({ monthKey, date, value: i === 0 ? netWorth : carry, live: i === 0 });
  }
  return out;
}

/** True when tracking fields would not change (skip a needless write). */
export function netWorthTrackingUnchanged(prev: Preferences, next: Preferences): boolean {
  return (
    prev.netWorthMonthKey === next.netWorthMonthKey &&
    prev.netWorthMonthBaseline === next.netWorthMonthBaseline &&
    prev.lastKnownNetWorth === next.lastKnownNetWorth &&
    JSON.stringify(prev.netWorthMonthlyHistory ?? []) === JSON.stringify(next.netWorthMonthlyHistory ?? [])
  );
}
