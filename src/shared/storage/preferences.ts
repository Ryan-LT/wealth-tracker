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
  netMonthIncome: 0,
  monthInflow: 0,
  monthOutflow: 0,
};
