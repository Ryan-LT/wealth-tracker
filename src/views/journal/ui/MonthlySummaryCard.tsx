import { formatVnd } from "@/shared/lib";
import { Card, ProgressBar } from "@/shared/ui";

type MonthlySummaryCardProps = {
  inflow: number;
  outflow: number;
};

export function MonthlySummaryCard({ inflow, outflow }: MonthlySummaryCardProps) {
  const yieldNet = inflow - outflow;
  const max = Math.max(inflow, outflow, 1);

  return (
    <Card className="lg:col-span-4 p-6 flex flex-col">
      <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest border-b border-outline-variant pb-2 mb-4">
        Monthly Summary
      </h3>
      <div className="space-y-6 flex-1 flex flex-col justify-center">
        <div>
          <div className="flex justify-between font-data-tabular text-data-tabular mb-2">
            <span className="text-on-surface-variant">Inflow</span>
            <span className="text-secondary">{formatVnd(inflow, { decimals: 2 })}</span>
          </div>
          <ProgressBar value={inflow} max={max} tone="secondary" />
        </div>
        <div>
          <div className="flex justify-between font-data-tabular text-data-tabular mb-2">
            <span className="text-on-surface-variant">Outflow</span>
            <span className="text-error">{formatVnd(outflow, { decimals: 2 })}</span>
          </div>
          <ProgressBar value={outflow} max={max} tone="error" />
        </div>
        <div className="pt-4 border-t border-outline-variant mt-auto">
          <div className="flex justify-between font-headline-md text-headline-md">
            <span className="text-primary">Net Yield</span>
            <span className="text-secondary">
              + {formatVnd(yieldNet, { decimals: 2 })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
