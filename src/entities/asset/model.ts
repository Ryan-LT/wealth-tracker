export type RealEstateProperty = {
  id: string;
  name: string;
  address: string;
  /** Material symbol icon name (e.g. "home", "apartment"). */
  icon: string;
  estValue: number;
  /** Subtitle line under the name in the UI. */
  badge: { kind: "growth" | "passive-income"; label: string };
};

export type CashAccount = {
  id: string;
  category: string;
  details: string;
  icon: string;
  /** Annualized yield as a percentage (e.g. 4.25 for 4.25%). */
  yieldPct: number;
  /** Optional annualized income hint shown in green next to the yield. */
  yieldIncome?: number;
  balance: number;
};

export type Investment = {
  id: string;
  name: string;
  icon: string;
  details: string;
  badge: { kind: "active" | "growth"; label: string };
  rateLabel: string;
  rateValue: string;
  rateIncomeNote: string;
  valueLabel: string;
  value: number;
};

export type AssetsState = {
  realEstate: RealEstateProperty[];
  cashAccounts: CashAccount[];
  investments: Investment[];
};

export const ASSETS_SEED: AssetsState = {
  realEstate: [],
  cashAccounts: [],
  investments: [],
};
