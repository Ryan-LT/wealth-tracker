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

import { AssetManagementTable } from "./AssetManagementTable";
import { DebtsSection } from "./DebtsSection";
import { IncomeSourcesGrid } from "./IncomeSourcesGrid";
import { PreferencesCard } from "./PreferencesCard";

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
    <main className="flex-1 overflow-y-auto w-full pb-24 md:pb-8 bg-background pt-stack-lg px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      <div className="mb-stack-lg">
        <h1 className="font-headline-lg text-headline-lg text-primary">Asset configuration</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
          Manage catalog assets, debts, income sources, and terminal preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-stack-lg">
        <div className="xl:col-span-2 flex flex-col gap-stack-lg">
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

        <div className="flex flex-col gap-stack-lg">
          <PreferencesCard preferences={prefs} onChange={setPrefs} />
        </div>
      </div>
    </main>
  );
}
