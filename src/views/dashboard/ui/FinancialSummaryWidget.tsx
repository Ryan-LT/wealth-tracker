import { formatVnd } from "@/shared/lib";

type FinancialSummaryWidgetProps = {
  totalAssets: number;
  totalLiabilities: number;
  /** Detailed portfolio store (real estate, cash, investments) — still included in net worth. */
  portfolioDetailTotal: number;
  /** Sum from Asset configuration catalog. */
  assetConfigurationTotal: number;
};

/**
 * Dark summary panel: asset breakdown and liabilities (net worth lives on NetWorthCard / app bar).
 * Total liabilities should be a positive number — the formatter adds the minus sign.
 */
export function FinancialSummaryWidget({
  totalAssets,
  totalLiabilities,
  portfolioDetailTotal,
  assetConfigurationTotal,
}: FinancialSummaryWidgetProps) {
  return (
    <section className="bg-tertiary-container text-on-tertiary rounded-lg border border-outline-variant/20 p-4 card-elevation flex flex-col">
      <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-tertiary-container mb-3">
        Financial summary
      </h3>
      <div className="space-y-2 flex-1 text-sm">
        <div className="flex justify-between items-baseline gap-3">
          <span className="text-on-tertiary-container/90">Asset configuration</span>
          <span className="font-data-tabular text-data-tabular font-medium tabular-nums shrink-0">
            {formatVnd(assetConfigurationTotal)}
          </span>
        </div>
        <div className="flex justify-between items-baseline gap-3">
          <span className="text-on-tertiary-container/90">Portfolio detail</span>
          <span className="font-data-tabular text-data-tabular font-medium tabular-nums shrink-0">
            {formatVnd(portfolioDetailTotal)}
          </span>
        </div>
        <div className="h-px bg-outline-variant/25 w-full my-1" />
        <div className="flex justify-between items-baseline gap-3">
          <span className="font-medium text-on-tertiary-container">Total assets</span>
          <span className="font-data-tabular text-data-tabular font-semibold tabular-nums shrink-0">
            {formatVnd(totalAssets)}
          </span>
        </div>
        <div className="flex justify-between items-baseline gap-3">
          <span className="text-on-tertiary-container/90">Liabilities</span>
          <span className="font-data-tabular text-data-tabular font-medium text-error-container tabular-nums shrink-0">
            −{formatVnd(totalLiabilities)}
          </span>
        </div>
      </div>
    </section>
  );
}
