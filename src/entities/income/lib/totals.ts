import type { IncomeSource } from "@/entities/income/model";

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
