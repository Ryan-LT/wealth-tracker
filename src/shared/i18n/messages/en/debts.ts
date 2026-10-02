/** Messages for the debts area. */
export const debts = {
  title: "Debts",
  description: "Loans, cards and other liabilities. Balances are subtracted from net worth.",
  add: "Add debt",
  allDebts: "All debts",
  rateKind: { Fixed: "Fixed", Variable: "Variable" },
  /** Lower-case rate kind for the mobile row ("8% variable"). */
  rateKindLower: { Fixed: "fixed", Variable: "variable" },
  kpi: {
    total: { label: "Total outstanding", hint: (p: { count: number }) => `${p.count} ${p.count === 1 ? "debt" : "debts"}` },
    avgRate: { label: "Avg interest rate", hint: "Weighted by balance" },
    variable: { label: "Variable-rate balance", hint: (p: { pct: string }) => `${p.pct} of all debt`, none: "No debt" },
    interest: { label: "Interest per month", hint: "Balance × rate ÷ 12" },
  },
  columns: {
    name: "Name",
    balance: "Balance",
    rate: "Rate",
    payoff: "Payoff",
    payment: "Payment",
  },
  payoff: {
    paidOff: "Paid off",
    addPayment: "Add a monthly payment",
    never: "Never at this payment",
    /** Wraps the interest amount: "Interest alone is {money} / month". */
    interestAlonePrefix: "Interest alone is ",
    interestAloneSuffix: " / month",
    /** Follows the interest amount: "{money} interest left". */
    interestLeft: " interest left",
  },
  paymentDay: (p: { day: number }) => `Day ${p.day} each month`,
  empty: {
    title: "No debts recorded",
    description: "Track mortgages, car loans and credit cards to see your true net worth.",
  },
  toast: {
    updated: "Debt updated",
    added: "Debt added",
    deleted: "Debt deleted",
  },
  confirmDelete: {
    title: "Delete debt?",
    description: (p: { name: string }) => `Remove "${p.name}" from your liabilities list?`,
  },
  form: {
    addTitle: "Add debt",
    editTitle: "Edit debt",
    description: "Outstanding balances count against your net worth.",
    nameRequired: "Give this debt a name",
    name: "Name",
    namePlaceholder: "e.g. Mortgage, credit card",
    balance: "Outstanding balance",
    rate: "Interest rate",
    rateHint: "Annual, 0–100%.",
    rateKind: "Rate type",
    monthlyPayment: "Monthly payment",
    monthlyPaymentHint: "What you repay each month. Used for the payoff date.",
    paymentDay: "Monthly payment day",
    paymentDayHint: "Day of the month the payment is due.",
    note: "Payment note",
    notePlaceholder: "e.g. 12.500.000 ₫, auto-debit from VCB",
    noteHint: "Optional reminder — amount, bank, reference.",
    submitAdd: "Add debt",
  },
};
