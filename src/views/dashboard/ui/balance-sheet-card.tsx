import { DescriptionList } from "@/shared/ui/description-list";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";

type BalanceSheetCardProps = {
  assetConfigurationTotal: number;
  portfolioDetailTotal: number;
  grossAssets: number;
  liabilities: number;
  netWorth: number;
};

export function BalanceSheetCard(p: BalanceSheetCardProps) {
  return (
    <Section title="Balance sheet" description="What you own minus what you owe.">
      <DescriptionList
        items={[
          { label: "Assets", value: <Money value={p.assetConfigurationTotal} /> },
          ...(p.portfolioDetailTotal > 0 ? [{ label: "Imported holdings", value: <Money value={p.portfolioDetailTotal} /> }] : []),
          { label: "Total assets", value: <Money value={p.grossAssets} />, emphasis: true },
          { label: "Debts", value: <Money value={-p.liabilities} tone={p.liabilities > 0 ? "danger" : "none"} /> },
          { label: "Net worth", value: <Money value={p.netWorth} />, emphasis: true },
        ]}
      />
    </Section>
  );
}
