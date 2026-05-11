export type Debt = {
  id: string;
  name: string;
  balance: number;
  ratePct: number;
  rateKind: "Fixed" | "Variable";
  /**
   * Day of month (1–31) when a payment is typically due; shown as the primary
   * “monthly payment date” in the UI.
   */
  paymentDayOfMonth?: number;
  /** Optional free-text note (amount reminder, reference, etc.). */
  nextPayment: string;
};

export const DEBTS_SEED: Debt[] = [];
