import type { Debt } from "@/entities/debt/model";

export function createDebtDraft(now: number = Date.now()): Debt {
  return {
    id: `debt-${now}`,
    name: "",
    balance: 0,
    ratePct: 0,
    rateKind: "Fixed",
    nextPayment: "",
  };
}

export function isValidDayOfMonth(day: number | null | undefined): day is number {
  return day != null && day >= 1 && day <= 31;
}

/** Persisted shape: name fallback, balance ≥ 0, rate 0–100, day 1–31 or omitted. */
export function sanitizeDebt(draft: Debt): Debt {
  const day = draft.paymentDayOfMonth;
  return {
    ...draft,
    name: draft.name.trim() || "Debt",
    balance: Math.max(0, draft.balance),
    ratePct: Math.min(100, Math.max(0, draft.ratePct)),
    rateKind: draft.rateKind,
    paymentDayOfMonth: isValidDayOfMonth(day) ? Math.floor(day) : undefined,
    nextPayment: draft.nextPayment.trim(),
  };
}

/** Payment column: "Day N each month" (+ note), the note alone, or a dash. */
export function describeDebtPayment(debt: Debt): { primary: string; secondary?: string } {
  const note = debt.nextPayment.trim();
  if (isValidDayOfMonth(debt.paymentDayOfMonth)) {
    return {
      primary: `Day ${debt.paymentDayOfMonth} each month`,
      secondary: note || undefined,
    };
  }
  return { primary: note || "—" };
}

/** Balance-weighted average interest rate (percent). */
export function weightedAverageRate(debts: Debt[]): number {
  const total = debts.reduce((s, d) => s + Math.max(0, d.balance), 0);
  if (total <= 0) return 0;
  return debts.reduce((s, d) => s + Math.max(0, d.balance) * d.ratePct, 0) / total;
}
