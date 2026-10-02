import { activeMessages } from "@/shared/i18n/active";
import type {
  PersonalLoan,
  PersonalLoanDirection,
} from "@/entities/personal-loan/model";
import { todayIso } from "@/shared/lib/date";

export function createPersonalLoanDraft(
  direction: PersonalLoanDirection = "lent_out",
  now: Date = new Date(),
): PersonalLoan {
  return {
    id: `loan-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    person: "",
    amount: 0,
    direction,
    // Local calendar day (UTC would be "yesterday" before 7am in Vietnam).
    date: todayIso(now),
    status: "open",
    note: "",
  };
}

/** Open first, then newest date first, then person A–Z. */
export function sortPersonalLoans(loans: PersonalLoan[]): PersonalLoan[] {
  return [...loans].sort((a, b) => {
    if (a.status !== b.status) return a.status === "open" ? -1 : 1;
    const ad = a.date ?? "";
    const bd = b.date ?? "";
    if (ad !== bd) return ad < bd ? 1 : -1;
    return a.person.localeCompare(b.person);
  });
}

/** Sum of open entries, optionally for one direction. */
export function totalOpenAmount(
  loans: PersonalLoan[],
  direction?: PersonalLoanDirection,
): number {
  return loans
    .filter((l) => l.status === "open" && (!direction || l.direction === direction))
    .reduce((sum, l) => sum + (Number.isFinite(l.amount) ? l.amount : 0), 0);
}

/** Persisted shape: person fallback, amount ≥ 0, blank note/date omitted. */
export function sanitizePersonalLoan(draft: PersonalLoan): PersonalLoan {
  return {
    ...draft,
    person: draft.person.trim() || activeMessages().domain.fallbacks.someone,
    amount: Math.max(0, Number.isFinite(draft.amount) ? draft.amount : 0),
    note: draft.note?.trim() ? draft.note.trim() : undefined,
    date: draft.date && draft.date.trim() ? draft.date : undefined,
    status: draft.status === "settled" ? "settled" : "open",
  };
}

export function toggleLoanStatus(loan: PersonalLoan): PersonalLoan {
  return { ...loan, status: loan.status === "settled" ? "open" : "settled" };
}
