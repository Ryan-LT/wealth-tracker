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
  return (
    <Section title="Monthly cash flow" description="Average month, used by every projection.">
      <DescriptionList
        items={[
          { label: "Active income", value: <Money value={p.activeIncome} /> },
          { label: "Passive income", value: <Money value={p.passiveIncome} /> },
          { label: "Average spending", value: <Money value={-p.averageSpending} tone={p.averageSpending > 0 ? "danger" : "none"} /> },
          { label: "Monthly net", value: <Money value={p.monthlyNet} signed tone="auto" />, emphasis: true },
        ]}
      />
    </Section>
  );
}
