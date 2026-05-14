"use client";

import { cn, formatVnd } from "@/shared/lib";
import type { PersonalLoan } from "@/shared/storage";
import { MaterialIcon } from "@/shared/ui";

type LoanCardProps = {
  loan: PersonalLoan;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSettled: () => void;
};

function formatLoanDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function LoanCard({ loan, onEdit, onDelete, onToggleSettled }: LoanCardProps) {
  const isLent = loan.direction === "lent_out";
  const settled = loan.status === "settled";

  return (
    <div
      className={cn(
        "rounded-lg border bg-surface-container-lowest p-stack-md transition-colors",
        settled
          ? "border-outline-variant/50 opacity-60"
          : "border-outline-variant",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-stack-sm">
        <div className="min-w-0">
          <h4 className="font-body-lg text-body-lg font-medium text-on-surface">
            {loan.person || "—"}
          </h4>
          <p className="mt-0.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            {formatLoanDate(loan.date)}
          </p>
        </div>
        <div className="shrink-0 text-end">
          <p
            className={cn(
              "font-data-tabular text-data-tabular text-[18px] font-semibold",
              settled
                ? "text-on-surface-variant line-through"
                : isLent
                  ? "text-secondary"
                  : "text-error",
            )}
          >
            {formatVnd(loan.amount)}
          </p>
          <p className="mt-0.5 font-label-sm text-label-sm text-on-surface-variant">
            {settled ? "Settled" : isLent ? "Owed to you" : "You owe"}
          </p>
        </div>
      </div>

      {loan.note ? (
        <p className="mb-2 whitespace-pre-line font-body-md text-body-md text-on-surface-variant">
          {loan.note}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          aria-label={settled ? `Mark ${loan.person} as open` : `Mark ${loan.person} as settled`}
          onClick={onToggleSettled}
          className={cn(
            "rounded p-1 transition-colors",
            settled
              ? "text-on-surface-variant hover:text-secondary"
              : "text-on-surface-variant hover:text-secondary",
          )}
          title={settled ? "Reopen" : "Mark as settled"}
        >
          <MaterialIcon name={settled ? "undo" : "check_circle"} filled={!settled} />
        </button>
        <button
          type="button"
          aria-label={`Edit loan with ${loan.person}`}
          onClick={onEdit}
          className="rounded p-1 text-on-surface-variant transition-colors hover:text-secondary"
        >
          <MaterialIcon name="edit" />
        </button>
        <button
          type="button"
          aria-label={`Delete loan with ${loan.person}`}
          onClick={onDelete}
          className="rounded p-1 text-on-surface-variant transition-colors hover:text-error"
        >
          <MaterialIcon name="delete" />
        </button>
      </div>
    </div>
  );
}
