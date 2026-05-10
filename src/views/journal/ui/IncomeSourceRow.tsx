import { formatVnd } from "@/shared/lib";
import type { IncomeSource } from "@/shared/storage";
import { MaterialIcon } from "@/shared/ui";

type IncomeSourceRowProps = {
  source: IncomeSource;
};

export function IncomeSourceRow({ source }: IncomeSourceRowProps) {
  return (
    <li className="flex justify-between items-center p-3 rounded hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-surface border border-outline-variant flex items-center justify-center text-on-surface-variant">
          <MaterialIcon name={source.icon} size={20} />
        </div>
        <div>
          <p className="font-body-md text-body-md text-primary font-medium">{source.name}</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">{source.details}</p>
        </div>
      </div>
      <span className="font-data-tabular text-data-tabular text-secondary text-right">
        {formatVnd(source.monthly, { decimals: 2 })}
      </span>
    </li>
  );
}
