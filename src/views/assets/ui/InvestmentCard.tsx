import { formatVnd } from "@/shared/lib";
import type { Investment } from "@/shared/storage";
import { Badge, MaterialIcon } from "@/shared/ui";

type InvestmentCardProps = {
  investment: Investment;
};

export function InvestmentCard({ investment }: InvestmentCardProps) {
  return (
    <div className="p-4 bg-surface border border-outline-variant rounded-DEFAULT">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <MaterialIcon name={investment.icon} className="text-primary" />
          <h4 className="font-body-lg text-body-lg text-primary font-medium">
            {investment.name}
          </h4>
        </div>
        <Badge tone="success" uppercase>
          {investment.badge.label}
        </Badge>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant mb-4 whitespace-pre-line">
        {investment.details}
      </p>
      <div className="flex justify-between items-end gap-4">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            {investment.rateLabel}
          </p>
          <p className="font-data-tabular text-data-tabular text-secondary font-medium">
            {investment.rateValue} {investment.rateIncomeNote}
          </p>
        </div>
        <div className="text-right">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            {investment.valueLabel}
          </p>
          <p className="font-data-tabular text-[18px] text-primary font-semibold">
            {formatVnd(investment.value)}
          </p>
        </div>
      </div>
    </div>
  );
}
