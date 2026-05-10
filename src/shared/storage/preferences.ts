export type Preferences = {
  baseCurrency: "VND";
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  /** Net income figure shown in the Journal. */
  netMonthIncome: number;
  /** Inflow / outflow used by the Monthly Summary card. */
  monthInflow: number;
  monthOutflow: number;
};

export const PREFERENCES_SEED: Preferences = {
  baseCurrency: "VND",
  dateFormat: "DD/MM/YYYY",
  netMonthIncome: 14_250,
  monthInflow: 20_000_000,
  monthOutflow: 5_750_000,
};

export type DashboardSummary = {
  totalNetWorth: number;
  monthChangePct: number;
  activeIncome: number;
  passiveIncome: number;
  totalDebt: number;
  eoyProjection: number;
};

export const DASHBOARD_SEED: DashboardSummary = {
  totalNetWorth: 1_245_670_000,
  monthChangePct: 4.2,
  activeIncome: 12_450_000,
  passiveIncome: 3_200_000,
  totalDebt: -45_000_000,
  eoyProjection: 1_350_000_000,
};
