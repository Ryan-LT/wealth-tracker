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
 * Dark summary panel: breakdown of gross assets, liabilities, and net worth.
 * Total liabilities should be a positive number — the formatter adds the minus sign.
 */
export function FinancialSummaryWidget({
  totalAssets,
  totalLiabilities,
  portfolioDetailTotal,
  assetConfigurationTotal,
}: FinancialSummaryWidgetProps) {
  const netWorth = totalAssets - totalLiabilities;

  return (
    <section className="bg-tertiary-container text-on-tertiary rounded-DEFAULT p-6 card-elevation h-full flex flex-col">
      <h3 className="text-headline-md font-headline-md tracking-tight mb-6">
        Financial Summary
      </h3>
      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center gap-4">
          <span className="font-body-md text-body-md text-on-tertiary-container">
            Asset configuration
          </span>
          <span className="font-data-tabular text-data-tabular font-medium">
            {formatVnd(assetConfigurationTotal)}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="font-body-md text-body-md text-on-tertiary-container">
            Portfolio detail
          </span>
          <span className="font-data-tabular text-data-tabular font-medium">
            {formatVnd(portfolioDetailTotal)}
          </span>
        </div>
        <div className="h-px bg-outline-variant/30 w-full" />
        <div className="flex justify-between items-center">
          <span className="font-body-md text-body-md font-medium text-on-tertiary-container">
            Total assets
          </span>
          <span className="font-data-tabular text-data-tabular font-semibold">
            {formatVnd(totalAssets)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body-md text-body-md text-on-tertiary-container">
            Total Liabilities
          </span>
          <span className="font-data-tabular text-data-tabular font-medium text-error-container">
            -{formatVnd(totalLiabilities)}
          </span>
        </div>
        <div className="h-px bg-outline-variant/30 w-full my-2" />
        <div className="flex justify-between items-center">
          <span className="text-body-lg font-body-lg font-medium">Net Worth</span>
          <span className="font-data-tabular text-[20px] font-bold text-secondary-fixed-dim">
            {formatVnd(netWorth)}
          </span>
        </div>
      </div>
    </section>
  );
}
