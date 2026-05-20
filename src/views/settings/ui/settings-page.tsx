"use client";

import { useMemo } from "react";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { ThemeSwitch } from "@/components/theme-switch";
import { Separator } from "@/components/ui/separator";
import { mergeAssetCategoryOptions } from "@/shared/config";
import {
  DEBTS_SEED,
  INCOME_SOURCES_SEED,
  PREFERENCES_SEED,
  SETTINGS_ASSETS_SEED,
  useHydrated,
  useTable,
} from "@/shared/storage";

import { AssetManagementTable } from "./asset-management-table";
import { DebtsSection } from "./debts-section";
import { IncomeSourcesGrid } from "./income-sources-grid";

export function SettingsPage() {
  const hydrated = useHydrated();
  const [assets, setAssets] = useTable("settingsAssets", SETTINGS_ASSETS_SEED);
  const [debts, setDebts] = useTable("debts", DEBTS_SEED);
  const [sources, setSources] = useTable("incomeSources", INCOME_SOURCES_SEED);
  const [prefs, setPrefs] = useTable("preferences", PREFERENCES_SEED);

  const assetCategoryOptions = useMemo(
    () => mergeAssetCategoryOptions(prefs, assets),
    [prefs, assets],
  );

  return (
    <>
      <Header fixed>
        <h1 className="text-base font-medium">Asset configuration</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-4 max-md:hidden">
          <h1 className="text-2xl font-bold tracking-tight">Asset configuration</h1>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col gap-6">
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
            loading={!hydrated}
          />
          <DebtsSection
            debts={debts}
            onAdd={(debt) => setDebts((prev) => [...prev, debt])}
            onUpdate={(debt) =>
              setDebts((prev) => prev.map((d) => (d.id === debt.id ? debt : d)))
            }
            onDelete={(id) => setDebts((prev) => prev.filter((d) => d.id !== id))}
            loading={!hydrated}
          />
          <IncomeSourcesGrid
            sources={sources}
            onCreate={(source) => setSources((prev) => [...prev, source])}
            onUpdate={(source) =>
              setSources((prev) => prev.map((s) => (s.id === source.id ? source : s)))
            }
            onDelete={(id) => setSources((prev) => prev.filter((s) => s.id !== id))}
            loading={!hydrated}
          />
        </div>
      </Main>
    </>
  );
}
