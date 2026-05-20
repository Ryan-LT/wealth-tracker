export type IncomeSourceKind = "active" | "passive";

export type IncomeSource = {
  id: string;
  kind: IncomeSourceKind;
  name: string;
  details: string;
  icon: string;
  monthly: number;
  /** "Active" / "Passive" badge for the Settings page; payment day-of-month. */
  paymentDay?: number;
  paymentEntity?: string;
};

export const INCOME_SOURCES_SEED: IncomeSource[] = [];
