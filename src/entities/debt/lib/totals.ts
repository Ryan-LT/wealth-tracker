import type { Debt } from "../model";

export function totalDebtBalance(debts: Debt[]): number {
  return debts.reduce((s, d) => s + d.balance, 0);
}
