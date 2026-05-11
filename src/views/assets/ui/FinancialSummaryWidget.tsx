import { formatVnd } from "@/shared/lib";

type FinancialSummaryWidgetProps = {
  totalAssets: number;
  totalLiabilities: number;
  /** Portfolio sections on this page (real estate, cash, investments). */
  trackerAssetTotal: number;
  /** Sum from Settings → Asset Management catalog. */
  settingsCatalogTotal: number;
};

/**
 * Dark "summary" panel rendered alongside Debts. Total liabilities should be
 * passed as a positive number — the formatter renders the sign.
 */
export function FinancialSummaryWidget({
  totalAssets,
  totalLiabilities,
  trackerAssetTotal,
  settingsCatalogTotal,
}: FinancialSummaryWidgetProps) {
  const netWorth = totalAssets - totalLiabilities;

  return (
    <section className="bg-tertiary-container text-on-tertiary rounded-DEFAULT p-6 card-elevation">
      <h3 className="text-headline-md font-headline-md tracking-tight mb-6">
        Financial Summary
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <span className="font-body-md text-body-md text-on-tertiary-container">
            Tracker sections
          </span>
          <span className="font-data-tabular text-data-tabular font-medium">
            {formatVnd(trackerAssetTotal)}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="font-body-md text-body-md text-on-tertiary-container">
            Settings catalog
          </span>
          <span className="font-data-tabular text-data-tabular font-medium">
            {formatVnd(settingsCatalogTotal)}
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
          <span className="font-body-lg text-body-lg font-medium">Net Worth</span>
          <span className="font-data-tabular text-[20px] font-bold text-secondary-fixed-dim">
            {formatVnd(netWorth)}
          </span>
        </div>
      </div>
    </section>
  );
}
