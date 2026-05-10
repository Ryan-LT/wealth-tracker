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

export const TRANSACTIONS_SEED: Transaction[] = [
  {
    id: "tx-2023-10-24-salary",
    date: "2023-10-24",
    description: "Tech Corp Salary",
    asset: "Vanguard S&P 500",
    category: "Salary",
    nativeAmount: "VND 12,000,000.00",
    vndAmount: 12_000_000,
  },
  {
    id: "tx-2023-10-22-rent",
    date: "2023-10-22",
    description: "Tokyo Apartment Rent",
    asset: "Tokyo Apt",
    category: "Real Estate",
    nativeAmount: "JPY 420,000",
    vndAmount: 2_800_000,
  },
  {
    id: "tx-2023-10-20-tax",
    date: "2023-10-20",
    description: "Quarterly Tax Payment",
    asset: "Tax Authority",
    category: "Taxes",
    nativeAmount: "VND -4,500,000.00",
    vndAmount: -4_500_000,
  },
  {
    id: "tx-2023-10-18-consulting",
    date: "2023-10-18",
    description: "London Consulting Fee",
    asset: "UK Client",
    category: "Consulting",
    nativeAmount: "GBP 2,750.00",
    vndAmount: 3_350_000,
  },
  {
    id: "tx-2023-10-15-charter",
    date: "2023-10-15",
    description: "Private Jet Charter",
    asset: "Charter Co.",
    category: "Lifestyle",
    nativeAmount: "VND -1,250,000.00",
    vndAmount: -1_250_000,
  },
];

/** Recent terminal activity rows displayed on the Executive Dashboard. */
export type ActivityRow = {
  id: string;
  date: string;
  asset: string;
  category: string;
  amount: number;
};

export const ACTIVITY_SEED: ActivityRow[] = [
  {
    id: "act-2023-10-24",
    date: "2023-10-24",
    asset: "Vanguard S&P 500",
    category: "Investment",
    amount: 2_500_000,
  },
  {
    id: "act-2023-10-22",
    date: "2023-10-22",
    asset: "Chase Sapphire",
    category: "Debt Payment",
    amount: -1_200_000,
  },
  {
    id: "act-2023-10-20",
    date: "2023-10-20",
    asset: "Tech Corp Dividend",
    category: "Passive Income",
    amount: 450_000,
  },
];
