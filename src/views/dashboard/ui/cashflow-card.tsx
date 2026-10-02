"use client";

import { useI18n } from "@/shared/i18n";
import { DescriptionList } from "@/shared/ui/description-list";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";

type CashflowCardProps = {
  activeIncome: number;
  passiveIncome: number;
  averageSpending: number;
  monthlyNet: number;
};

export function CashflowCard(p: CashflowCardProps) {
  const { t } = useI18n();
  const m = t.dashboard.cashflow;
  return (
    <Section title={m.title} description={m.description}>
      <DescriptionList
        items={[
          { label: m.activeIncome, value: <Money value={p.activeIncome} /> },
          { label: m.passiveIncome, value: <Money value={p.passiveIncome} /> },
          { label: m.averageSpending, value: <Money value={-p.averageSpending} tone={p.averageSpending > 0 ? "danger" : "none"} /> },
          { label: m.monthlyNet, value: <Money value={p.monthlyNet} signed tone="auto" />, emphasis: true },
        ]}
      />
    </Section>
  );
}
