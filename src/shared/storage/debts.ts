export type Debt = {
  id: string;
  name: string;
  balance: number;
  ratePct: number;
  rateKind: "Fixed" | "Variable";
  /** Display string for the next payment, e.g. "Oct 01 (₫71.250.000)" */
  nextPayment: string;
};

export const DEBTS_SEED: Debt[] = [];
