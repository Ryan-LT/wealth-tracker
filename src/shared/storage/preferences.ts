/** Monthly net worth snapshots for charts / rollover ({@link syncNetWorthTracking}). */
export type NetWorthMonthSnapshot = {
  monthKey: string;
  value: number;
};

export type Preferences = {
  /** Net income fallback when month inflow/outflow are unset. */
  netMonthIncome: number;
  /** Inflow / outflow for resolved monthly cash flow when both are set. */
  monthInflow: number;
  monthOutflow: number;

  /** Calendar month key `YYYY-MM` aligned with MTD net-worth baseline. */
  netWorthMonthKey?: string;
  /** Net worth at MTD baseline (month rollover or first visit). */
  netWorthMonthBaseline?: number;
  /** Last recorded net worth (used when the calendar month rolls over). */
  lastKnownNetWorth?: number;
  /** Rolling closes used by the dashboard sparkline (latest entries retained). */
  netWorthMonthlyHistory?: NetWorthMonthSnapshot[];

  /** User-defined asset category labels (merged with built-in defaults in the UI). */
  extraAssetCategories?: string[];
};

export const PREFERENCES_SEED: Preferences = {
  netMonthIncome: 0,
  monthInflow: 0,
  monthOutflow: 0,
};
