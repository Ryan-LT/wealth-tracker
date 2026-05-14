"use client";

import { useMemo } from "react";

import { mergeAssetCategoryOptions } from "@/shared/config";
import {
  DEBTS_SEED,
  INCOME_SOURCES_SEED,
  PREFERENCES_SEED,
  SETTINGS_ASSETS_SEED,
  useTable,
} from "@/shared/storage";

import { SignOutButton } from "@/widgets/auth";

import { AssetManagementTable } from "./AssetManagementTable";
import { DebtsSection } from "./DebtsSection";
import { IncomeSourcesGrid } from "./IncomeSourcesGrid";

export function SettingsPage() {
  const [assets, setAssets] = useTable("settingsAssets", SETTINGS_ASSETS_SEED);
  const [debts, setDebts] = useTable("debts", DEBTS_SEED);
  const [sources, setSources] = useTable("incomeSources", INCOME_SOURCES_SEED);
  const [prefs, setPrefs] = useTable("preferences", PREFERENCES_SEED);

  const assetCategoryOptions = useMemo(
    () => mergeAssetCategoryOptions(prefs, assets),
    [prefs, assets],
  );

  return (
    <main className="flex w-full min-w-0 flex-1 flex-col overflow-y-auto bg-background pb-24 pt-stack-lg max-md:px-margin-mobile md:min-h-screen md:px-stack-lg md:pb-8">
      <div className="mb-stack-lg flex flex-col gap-stack-sm max-md:flex-col md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Asset configuration</h1>
        </div>
        <div className="md:shrink-0">
          <SignOutButton variant="outline-secondary" className="max-md:w-full" />
        </div>
      </div>

      <div className="flex flex-col gap-stack-lg">
        <AssetManagementTable
          assets={assets}
          categoryOptions={assetCategoryOptions}
          onRegisterCustomCategory={(category) =>
            setPrefs((p) => ({
              ...p,
              extraAssetCategories: [
                ...new Set([...(p.extraAssetCategories ?? []), category.trim()]),
              ],
            }))
          }
          onDelete={(id) => setAssets((prev) => prev.filter((a) => a.id !== id))}
          onUpdate={(next) =>
            setAssets((prev) => prev.map((a) => (a.id === next.id ? next : a)))
          }
          onAdd={(asset) => setAssets((prev) => [...prev, asset])}
          onReorder={(ordered) => setAssets(() => ordered)}
        />
        <DebtsSection
          debts={debts}
          onAdd={(debt) => setDebts((prev) => [...prev, debt])}
          onUpdate={(debt) =>
            setDebts((prev) => prev.map((d) => (d.id === debt.id ? debt : d)))
          }
          onDelete={(id) => setDebts((prev) => prev.filter((d) => d.id !== id))}
        />
        <IncomeSourcesGrid
          sources={sources}
          onCreate={(source) => setSources((prev) => [...prev, source])}
          onUpdate={(source) =>
            setSources((prev) => prev.map((s) => (s.id === source.id ? source : s)))
          }
          onDelete={(id) => setSources((prev) => prev.filter((s) => s.id !== id))}
        />
      </div>
    </main>
  );
}
