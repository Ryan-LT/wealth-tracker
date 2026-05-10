"use client";

import {
  EMPTY_GOAL_PROFILE,
  GOALS_SEED,
  INCOME_SOURCES_SEED,
  PREFERENCES_SEED,
  SETTINGS_ASSETS_SEED,
  useTable,
} from "@/shared/storage";

import { AssetManagementTable } from "./AssetManagementTable";
import { GoalConfigurationCard } from "./GoalConfigurationCard";
import { IncomeSourcesGrid } from "./IncomeSourcesGrid";
import { PreferencesCard } from "./PreferencesCard";

export function SettingsPage() {
  const [assets, setAssets] = useTable("settingsAssets", SETTINGS_ASSETS_SEED);
  const [sources, setSources] = useTable("incomeSources", INCOME_SOURCES_SEED);
  const [goals, setGoals] = useTable("goals", GOALS_SEED);
  const [prefs, setPrefs] = useTable("preferences", PREFERENCES_SEED);

  const activeProfile =
    goals.profiles.find((p) => p.id === goals.activeProfileId) ??
    goals.profiles[0] ??
    EMPTY_GOAL_PROFILE;

  return (
    <main className="flex-1 overflow-y-auto w-full pb-24 md:pb-8 bg-background pt-stack-lg px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      <div className="mb-stack-lg">
        <h1 className="font-headline-lg text-headline-lg text-primary">Settings &amp; Data</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
          Manage your assets, income, and terminal configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-stack-lg">
        <div className="xl:col-span-2 flex flex-col gap-stack-lg">
          <AssetManagementTable
            assets={assets}
            onDelete={(id) => setAssets((prev) => prev.filter((a) => a.id !== id))}
            onUpdate={(next) =>
              setAssets((prev) => prev.map((a) => (a.id === next.id ? next : a)))
            }
            onAdd={(asset) => setAssets((prev) => [...prev, asset])}
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
          <GoalConfigurationCard
            primaryTarget={activeProfile.targetAmount}
            targetDate={activeProfile.targetDate}
            onPrimaryTargetChange={(targetAmount) =>
              setGoals((prev) => ({
                ...prev,
                profiles: prev.profiles.map((p) =>
                  p.id === activeProfile.id ? { ...p, targetAmount } : p,
                ),
              }))
            }
            onTargetDateChange={(targetDate) =>
              setGoals((prev) => ({
                ...prev,
                profiles: prev.profiles.map((p) =>
                  p.id === activeProfile.id ? { ...p, targetDate } : p,
                ),
              }))
            }
          />
          <PreferencesCard preferences={prefs} onChange={setPrefs} />
        </div>
      </div>
    </main>
  );
}
