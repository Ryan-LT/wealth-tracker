export type Transaction = {
  id: string;
  date: string;
  description: string;
  asset: string;
  category: string;
  /**
   * Native currency amount as displayed (e.g. "VND 12,000,000.00", "JPY 420,000").
   * The Stitch HTML mixes currencies in this column, so we keep this as a free-form string.
   */
  nativeAmount: string;
  /** Equivalent in the base currency (signed, in VND). */
  vndAmount: number;
};

export const TRANSACTIONS_SEED: Transaction[] = [];

/** Recent terminal activity rows displayed on the Executive Dashboard. */
export type ActivityRow = {
  id: string;
  date: string;
  asset: string;
  category: string;
  amount: number;
};

export const ACTIVITY_SEED: ActivityRow[] = [];
