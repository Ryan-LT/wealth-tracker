"use client";

import { useI18n } from "@/shared/i18n";
import { DescriptionList } from "@/shared/ui/description-list";
import { Money } from "@/shared/ui/money";
import { Section } from "@/shared/ui/section";

type BalanceSheetCardProps = {
  assetConfigurationTotal: number;
  portfolioDetailTotal: number;
  grossAssets: number;
  liabilities: number;
  netWorth: number;
  /** Open personal loans counted in net worth (0 when the setting is off). */
  loansLent: number;
  loansBorrowed: number;
};

export function BalanceSheetCard(p: BalanceSheetCardProps) {
  const { t } = useI18n();
  const m = t.dashboard.balanceSheet;
  return (
    <Section title={m.title} description={m.description}>
      <DescriptionList
        items={[
          { label: m.assets, value: <Money value={p.assetConfigurationTotal} /> },
          ...(p.portfolioDetailTotal > 0 ? [{ label: m.importedHoldings, value: <Money value={p.portfolioDetailTotal} /> }] : []),
          ...(p.loansLent > 0 ? [{ label: m.lentToOthers, value: <Money value={p.loansLent} /> }] : []),
          { label: m.totalAssets, value: <Money value={p.grossAssets} />, emphasis: true },
          {
            label: m.debts,
            value: <Money value={-p.liabilities} tone={p.liabilities > 0 ? "danger" : "none"} />,
            hint: p.loansBorrowed > 0 ? <>
                {m.borrowedPrefix} <Money value={p.loansBorrowed} /> {m.borrowedSuffix}
              </> : undefined,
          },
          { label: m.netWorth, value: <Money value={p.netWorth} />, emphasis: true },
        ]}
      />
    </Section>
  );
}
