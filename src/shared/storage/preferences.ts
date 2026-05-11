/** Monthly net worth snapshots for charts / rollover ({@link syncNetWorthTracking}). */
export type NetWorthMonthSnapshot = {
  monthKey: string;
  value: number;
};

export type Preferences = {
  baseCurrency: "VND";
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  /** Net income figure shown in the Journal. */
  netMonthIncome: number;
  /** Inflow / outflow used by the Monthly Summary card. */
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
  baseCurrency: "VND",
  dateFormat: "DD/MM/YYYY",
  netMonthIncome: 0,
  monthInflow: 0,
  monthOutflow: 0,
};
