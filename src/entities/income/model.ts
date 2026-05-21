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
  /**
   * Capital (principal) invested to produce this income — in ₫. Mainly meaningful
   * for passive sources (deposits, bonds, real estate, dividend portfolios) where
   * the holder has put money in to earn the monthly return. Optional; leave 0/unset
   * for active income (salary, contracts) where no capital is invested.
   */
  capital?: number;
};

export const INCOME_SOURCES_SEED: IncomeSource[] = [];
