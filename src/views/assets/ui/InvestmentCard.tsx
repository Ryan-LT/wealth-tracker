import { formatVnd } from "@/shared/lib";
import type { Investment } from "@/shared/storage";
import { Badge, MaterialIcon } from "@/shared/ui";

type InvestmentCardProps = {
  investment: Investment;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function InvestmentCard({ investment, onEdit, onDelete }: InvestmentCardProps) {
  return (
    <div className="rounded-DEFAULT border border-outline-variant bg-surface p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <MaterialIcon name={investment.icon} className="shrink-0 text-primary" />
          <h4 className="font-body-lg text-body-lg font-medium text-primary">{investment.name}</h4>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          <Badge tone="success" uppercase>
            {investment.badge.label}
          </Badge>
          {onEdit ? (
            <button
              type="button"
              aria-label={`Edit ${investment.name}`}
              onClick={onEdit}
              className="p-2 text-on-surface-variant transition-colors hover:text-secondary"
            >
              <MaterialIcon name="edit" />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              aria-label={`Delete ${investment.name}`}
              onClick={onDelete}
              className="p-2 text-on-surface-variant transition-colors hover:text-error"
            >
              <MaterialIcon name="delete" />
            </button>
          ) : null}
        </div>
      </div>
      <p className="mb-4 whitespace-pre-line font-body-md text-body-md text-on-surface-variant">
        {investment.details}
      </p>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            {investment.rateLabel}
          </p>
          <p className="font-data-tabular text-data-tabular font-medium text-secondary">
            {investment.rateValue} {investment.rateIncomeNote}
          </p>
        </div>
        <div className="text-right">
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            {investment.valueLabel}
          </p>
          <p className="font-data-tabular text-[18px] font-semibold text-primary">
            {formatVnd(investment.value)}
          </p>
        </div>
      </div>
    </div>
  );
}
