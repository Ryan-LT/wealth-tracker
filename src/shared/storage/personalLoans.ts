/**
 * Side-notebook entries for informal money loans between the user and other
 * people. Intentionally NOT referenced by net-worth, allocations, goal plans,
 * or any aggregate calculation — purely a personal log.
 */
export type PersonalLoanDirection = "lent_out" | "borrowed";

export type PersonalLoanStatus = "open" | "settled";

export type PersonalLoan = {
  id: string;
  /** Counterparty name (free text). */
  person: string;
  /** VND amount; always stored as a positive number, sign comes from `direction`. */
  amount: number;
  /** "lent_out" = user gave money to person; "borrowed" = user owes person. */
  direction: PersonalLoanDirection;
  /** ISO date string (YYYY-MM-DD) of when the loan happened. Optional. */
  date?: string;
  /** "open" while outstanding, "settled" once repaid. Defaults to "open". */
  status: PersonalLoanStatus;
  /** Free-text reminder (purpose, expected return, etc.). Optional. */
  note?: string;
};

export const PERSONAL_LOANS_SEED: PersonalLoan[] = [];
