import type { ReactNode } from "react";

import { cn } from "@/shared/lib";
import { formatVnd } from "@/shared/lib";
import type { Debt } from "@/entities/debt";

function formatRatePctVi(ratePct: number): string {
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(ratePct);
}

type DebtRowProps = {
  debt: Debt;
  isLast: boolean;
  actions?: ReactNode;
};

export function DebtRow({ debt, isLast, actions }: DebtRowProps) {
  return (
    <div className={cn(!isLast && "border-b border-border")}>
      <div className="mb-1 flex items-start justify-between gap-3">
        <h4 className="min-w-0 text-base font-medium">{debt.name}</h4>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-base font-semibold font-data-tabular tabular-nums">
            {formatVnd(debt.balance)}
          </span>
          {actions}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Rate
            </p>
            <p className="text-sm font-data-tabular tabular-nums text-destructive">
              {formatRatePctVi(debt.ratePct)}% {debt.rateKind}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Payment
            </p>
            <p className="text-sm font-data-tabular tabular-nums text-muted-foreground">
              {debt.paymentDayOfMonth != null &&
              debt.paymentDayOfMonth >= 1 &&
              debt.paymentDayOfMonth <= 31 ? (
                <>
                  <span className="text-foreground">
                    Day {debt.paymentDayOfMonth}
                  </span>
                  <span> each month</span>
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
              <p className="mt-0.5 text-xs text-muted-foreground">
                {debt.nextPayment}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
