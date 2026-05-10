import { formatVnd } from "@/shared/lib";
import type { CashAccount } from "@/shared/storage";
import { Card, SectionHeader } from "@/shared/ui";

import { CashRow } from "./CashRow";

type CashEquivalentsSectionProps = {
  accounts: CashAccount[];
};

export function CashEquivalentsSection({ accounts }: CashEquivalentsSectionProps) {
  const total = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <Card variant="section" className="p-6">
      <SectionHeader
        title="Cash & Equivalents"
        subtitle="Liquidity Overview"
        end={
          <>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Total Liquidity
            </p>
            <p className="font-data-tabular text-[24px] leading-[32px] font-semibold text-primary">
              {formatVnd(total)}
            </p>
          </>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Category
              </th>
              <th className="py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Details
              </th>
              <th className="py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">
                Yield/Income
              </th>
              <th className="py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">
                Balance (VND)
              </th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md">
            {accounts.map((account, idx) => (
              <CashRow
                key={account.id}
                account={account}
                isLast={idx === accounts.length - 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
