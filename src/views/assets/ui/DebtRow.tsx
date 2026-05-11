import type { ReactNode } from "react";

import { cn, formatVnd } from "@/shared/lib";
import type { Debt } from "@/shared/storage";

function formatRatePctVi(ratePct: number): string {
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(ratePct);
}

type DebtRowProps = {
  debt: Debt;
  isLast: boolean;
  /** Optional edit/delete controls (Asset & Debt Tracker management mode). */
  actions?: ReactNode;
};

export function DebtRow({ debt, isLast, actions }: DebtRowProps) {
  return (
    <div
      className={cn(
        "pb-4",
        !isLast && "border-b border-surface-container-high",
      )}
    >
      <div className="flex justify-between items-start mb-1 gap-3">
        <h4 className="min-w-0 font-body-lg text-body-lg text-primary font-medium">{debt.name}</h4>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-data-tabular text-[16px] text-primary font-semibold">
            {formatVnd(debt.balance)}
          </span>
          {actions}
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Rate
            </p>
            <p className="font-data-tabular text-data-tabular text-error">
              {formatRatePctVi(debt.ratePct)}% {debt.rateKind}
            </p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Payment
            </p>
            <p className="font-data-tabular text-data-tabular text-on-surface-variant">
              {debt.paymentDayOfMonth != null &&
              debt.paymentDayOfMonth >= 1 &&
              debt.paymentDayOfMonth <= 31 ? (
                <>
                  <span className="text-primary">Day {debt.paymentDayOfMonth}</span>
                  <span className="text-on-surface-variant"> each month</span>
                </>
              ) : debt.nextPayment.trim() ? (
                debt.nextPayment
              ) : (
                "—"
              )}
            </p>
            {debt.paymentDayOfMonth != null &&
            debt.paymentDayOfMonth >= 1 &&
            debt.paymentDayOfMonth <= 31 &&
            debt.nextPayment.trim() ? (
              <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                {debt.nextPayment}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
