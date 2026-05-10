import type { Debt } from "@/shared/storage";
import { Card, MaterialIcon } from "@/shared/ui";

import { DebtRow } from "./DebtRow";

type DebtsSectionProps = {
  debts: Debt[];
};

export function DebtsSection({ debts }: DebtsSectionProps) {
  return (
    <Card variant="section" className="p-6">
      <div className="flex justify-between items-end border-b border-surface-container-high pb-4 mb-6">
        <div>
          <h3 className="text-headline-md font-headline-md text-primary tracking-tight flex items-center gap-2">
            <MaterialIcon name="money_off" className="text-error" />
            Debts &amp; Liabilities
          </h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 uppercase tracking-wider">
            Obligations Overview
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {debts.map((debt, idx) => (
          <DebtRow key={debt.id} debt={debt} isLast={idx === debts.length - 1} />
        ))}
      </div>
    </Card>
  );
}
