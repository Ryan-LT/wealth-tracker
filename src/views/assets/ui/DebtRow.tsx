import { cn, formatVnd } from "@/shared/lib";
import type { Debt } from "@/shared/storage";

type DebtRowProps = {
  debt: Debt;
  isLast: boolean;
};

export function DebtRow({ debt, isLast }: DebtRowProps) {
  return (
    <div
      className={cn(
        "pb-4",
        !isLast && "border-b border-surface-container-high",
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-body-lg text-body-lg text-primary font-medium">{debt.name}</h4>
        <span className="font-data-tabular text-[16px] text-primary font-semibold">
          {formatVnd(debt.balance)}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Rate
            </p>
            <p className="font-data-tabular text-data-tabular text-error">
              {debt.ratePct.toFixed(2)}% {debt.rateKind}
            </p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Next Payment
            </p>
            <p className="font-data-tabular text-data-tabular text-on-surface-variant">
              {debt.nextPayment}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
