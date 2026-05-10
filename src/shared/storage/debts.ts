export type Debt = {
  id: string;
  name: string;
  balance: number;
  ratePct: number;
  rateKind: "Fixed" | "Variable";
  /** Display string for the next payment, e.g. "Oct 01 (₫71.250.000)" */
  nextPayment: string;
};

export const DEBTS_SEED: Debt[] = [
  {
    id: "mortgage-primary",
    name: "Mortgage - Primary",
    balance: 11_250_000_000,
    ratePct: 3.25,
    rateKind: "Fixed",
    nextPayment: "Oct 01 (₫71.250.000)",
  },
  {
    id: "auto-loan",
    name: "Auto Loan",
    balance: 612_500_000,
    ratePct: 5.5,
    rateKind: "Fixed",
    nextPayment: "Sep 15 (₫11.250.000)",
  },
];
