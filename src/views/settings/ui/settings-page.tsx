"use client";

import { useMemo } from "react";

import { Header } from "@/widgets/page-header";
import { Main } from "@/widgets/page-shell";
import { ProfileDropdown } from "@/widgets/profile-menu";
import { ThemeSwitch } from "@/widgets/theme-switch";
import { Separator } from "@/components/ui/separator";
import { ASSETS_SEED, type AssetsState } from "@/entities/asset";
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
  const [richAssets] = useTable<AssetsState>("assets", ASSETS_SEED);
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
        <h1 className="text-lg font-semibold md:text-base md:font-medium">
          Asset configuration
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <Separator className="my-4 hidden md:block" />

        <div className="flex flex-col gap-6">
          <AssetManagementTable
            assets={assets}
            categoryOptions={assetCategoryOptions}
            onRegisterCustomCategory={(category) =>
              setPrefs((p) => ({
                ...p,
                extraAssetCategories: [
                  ...new Set([
                    ...(p.extraAssetCategories ?? []),
                    category.trim(),
                  ]),
                ],
              }))
            }
            onDelete={(id) =>
              setAssets((prev) => prev.filter((a) => a.id !== id))
            }
            onUpdate={(next) =>
              setAssets((prev) =>
                prev.map((a) => (a.id === next.id ? next : a)),
              )
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
            onDelete={(id) =>
              setDebts((prev) => prev.filter((d) => d.id !== id))
            }
            loading={!hydrated}
          />
          <IncomeSourcesGrid
            sources={sources}
            assets={richAssets}
            settingsAssets={assets}
            onCreate={(source) => setSources((prev) => [...prev, source])}
            onUpdate={(source) =>
              setSources((prev) =>
                prev.map((s) => (s.id === source.id ? source : s)),
              )
            }
            onDelete={(id) =>
              setSources((prev) => prev.filter((s) => s.id !== id))
            }
            loading={!hydrated}
          />
        </div>
      </Main>
    </>
  );
}
