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
  realEstate: [
    {
      id: "primary-residence",
      name: "Primary Residence",
      address: "123 Main St, Tech City",
      icon: "home",
      estValue: 21_250_000_000,
      badge: { kind: "growth", label: "Passive Value Growth" },
    },
    {
      id: "rental-unit-a",
      name: "Rental Unit A",
      address: "456 Oak Ave, Commerce Dist",
      icon: "apartment",
      estValue: 10_000_000_000,
      badge: {
        kind: "passive-income",
        label: "+₫60.000.000/mo Passive Income",
      },
    },
  ],
  cashAccounts: [
    {
      id: "physical-cash",
      category: "Physical Cash",
      details: "Safe Deposit Box",
      icon: "account_balance_wallet",
      yieldPct: 0,
      balance: 125_000_000,
    },
    {
      id: "fx-eur",
      category: "Foreign Currency (EUR)",
      details: "€10,000 @ 27.000 VND/EUR",
      icon: "currency_exchange",
      yieldPct: 0,
      balance: 270_000_000,
    },
    {
      id: "high-yield-savings",
      category: "High-Yield Savings",
      details: "Chase Bank - Acct *4421",
      icon: "savings",
      yieldPct: 4.25,
      yieldIncome: 15_000_000,
      balance: 3_750_000_000,
    },
    {
      id: "checking",
      category: "Checking Account",
      details: "Bank of America - Acct *9901",
      icon: "account_balance",
      yieldPct: 0.01,
      balance: 490_512_500,
    },
  ],
  investments: [
    {
      id: "personal-loan",
      name: "Personal Loan",
      icon: "handshake",
      details: "Lent to: Smith Business LLC\nTerm: 5 Years",
      badge: { kind: "active", label: "Active" },
      rateLabel: "Interest Rate",
      rateValue: "8.00%",
      rateIncomeNote: "(+₫80.000.000/yr)",
      valueLabel: "Principal Balance",
      value: 1_000_000_000,
    },
    {
      id: "index-fund",
      name: "Index Fund Portfolio",
      icon: "show_chart",
      details: "Vanguard S&P 500 ETF (VOO)\nBrokerage: Fidelity",
      badge: { kind: "growth", label: "Growth" },
      rateLabel: "Avg. Dividend Yield",
      rateValue: "1.40%",
      rateIncomeNote: "(+₫105.000.000/yr)",
      valueLabel: "Market Value",
      value: 7_500_000_000,
    },
  ],
};
