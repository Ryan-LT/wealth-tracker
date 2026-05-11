"use client";

import { useMemo } from "react";

import {
  formatVnd,
  totalAssetValue,
  totalCombinedAssetValue,
  totalDebtBalance,
  totalSettingsAssetsValue,
} from "@/shared/lib";
import {
  ASSETS_SEED,
  DEBTS_SEED,
  SETTINGS_ASSETS_SEED,
  type AssetsState,
  useTable,
} from "@/shared/storage";
import { TopAppBar } from "@/widgets/top-app-bar";

import { CashEquivalentsSection } from "./CashEquivalentsSection";
import { CatalogAssetsSection } from "./CatalogAssetsSection";
import { DebtsSection } from "./DebtsSection";
import { FinancialSummaryWidget } from "./FinancialSummaryWidget";
import { LendingInvestmentsSection } from "./LendingInvestmentsSection";
import { RealEstateSection } from "./RealEstateSection";

export function AssetsPage() {
  const [assets, setAssets] = useTable<AssetsState>("assets", ASSETS_SEED);
  const [debts, setDebts] = useTable("debts", DEBTS_SEED);
  const [settingsAssets] = useTable("settingsAssets", SETTINGS_ASSETS_SEED);

  const totals = useMemo(() => {
    const tracker = totalAssetValue(assets);
    const catalog = totalSettingsAssetsValue(settingsAssets);
    const gross = totalCombinedAssetValue(assets, settingsAssets);
    const liabilities = totalDebtBalance(debts);
    return {
      totalAssets: gross,
      trackerAssetTotal: tracker,
      settingsCatalogTotal: catalog,
      liabilities,
    };
  }, [assets, debts, settingsAssets]);

  return (
    <>
      <TopAppBar
        start={
          <h2 className="text-headline-md font-headline-md text-primary tracking-tight">
            Asset &amp; Debt Tracker
          </h2>
        }
        metricLabel="Metric: Net Worth"
        metricValue={formatVnd(totals.totalAssets - totals.liabilities)}
      />
      <main className="px-margin-mobile md:px-gutter py-stack-lg max-w-container-max mx-auto pb-24 md:pb-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg">
          <div className="lg:col-span-8 space-y-stack-lg">
            <RealEstateSection
              properties={assets.realEstate}
              onChange={(realEstate) =>
                setAssets((prev) => ({ ...prev, realEstate }))
              }
            />
            <CashEquivalentsSection accounts={assets.cashAccounts} />
            <LendingInvestmentsSection investments={assets.investments} />
            <CatalogAssetsSection items={settingsAssets} />
          </div>
          <div className="lg:col-span-4 space-y-stack-lg">
            <DebtsSection
              debts={debts}
              onAdd={(debt) => setDebts((prev) => [...prev, debt])}
              onUpdate={(debt) =>
                setDebts((prev) => prev.map((d) => (d.id === debt.id ? debt : d)))
              }
              onDelete={(id) => setDebts((prev) => prev.filter((d) => d.id !== id))}
            />
            <FinancialSummaryWidget
              totalAssets={totals.totalAssets}
              totalLiabilities={totals.liabilities}
              trackerAssetTotal={totals.trackerAssetTotal}
              settingsCatalogTotal={totals.settingsCatalogTotal}
            />
          </div>
        </div>
      </main>
    </>
  );
}
