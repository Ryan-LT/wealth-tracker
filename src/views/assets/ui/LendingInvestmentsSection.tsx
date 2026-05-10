import { formatVnd } from "@/shared/lib";
import type { Investment } from "@/shared/storage";
import { Card, SectionHeader } from "@/shared/ui";

import { InvestmentCard } from "./InvestmentCard";

type LendingInvestmentsSectionProps = {
  investments: Investment[];
};

export function LendingInvestmentsSection({ investments }: LendingInvestmentsSectionProps) {
  const total = investments.reduce((sum, i) => sum + i.value, 0);

  return (
    <Card variant="section" className="p-6">
      <SectionHeader
        title="Lending & Investments"
        subtitle="Yield-Generating Assets"
        end={
          <>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Total Value
            </p>
            <p className="font-data-tabular text-[24px] leading-[32px] font-semibold text-primary">
              {formatVnd(total)}
            </p>
          </>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {investments.map((investment) => (
          <InvestmentCard key={investment.id} investment={investment} />
        ))}
      </div>
    </Card>
  );
}
