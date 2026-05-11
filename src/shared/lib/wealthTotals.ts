import type { AssetsState } from "@/shared/storage/assets";
import type { Debt } from "@/shared/storage/debts";
import type { IncomeSource } from "@/shared/storage/incomeSources";

export function totalAssetValue(assets: AssetsState): number {
  const realEstate = assets.realEstate.reduce((s, p) => s + p.estValue, 0);
  const cash = assets.cashAccounts.reduce((s, a) => s + a.balance, 0);
  const investments = assets.investments.reduce((s, i) => s + i.value, 0);
  return realEstate + cash + investments;
}

export function totalDebtBalance(debts: Debt[]): number {
  return debts.reduce((s, d) => s + d.balance, 0);
}

export function monthlyIncomeByKind(
  sources: IncomeSource[],
  kind: IncomeSource["kind"],
): number {
  return sources.filter((s) => s.kind === kind).reduce((s, x) => s + x.monthly, 0);
}

/** Sum of all income source monthly amounts (active + passive). */
export function totalMonthlyIncomeFromSources(sources: IncomeSource[]): number {
  return sources.reduce((sum, s) => sum + (s.monthly || 0), 0);
}
