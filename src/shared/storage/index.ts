export {
  flushTablesNow,
  readTable,
  writeTable,
  useTable,
  useHydrated,
} from "./store";

export { TABLE_KEYS, isTableKey, type TableKey } from "./table-keys";

// Migration shims: entity models live under @/entities/<name>.
// Existing consumers can continue to import from here for now.
export {
  ASSETS_SEED,
  type AssetsState,
  type CashAccount,
  type Investment,
  type RealEstateProperty,
} from "@/entities/asset";
export { DEBTS_SEED, type Debt } from "@/entities/debt";
export {
  INCOME_SOURCES_SEED,
  type IncomeSource,
  type IncomeSourceKind,
} from "@/entities/income";
export {
  SETTINGS_ASSETS_SEED,
  SETTINGS_ASSET_LIQUIDITY_DEFAULT,
  resolveSettingsAssetLiquidity,
  settingsAssetLiquidityLabel,
  type SettingsAsset,
  type SettingsAssetLiquidity,
} from "@/entities/settings-asset";

export {
  EMPTY_GOAL_PROFILE,
  GOALS_SEED,
  GOAL_PLAN_NEW_SENTINEL,
  GOAL_SIMULATOR_NEW_SENTINEL,
  goalProfileForDashboard,
  type GoalCheckpoint,
  type GoalProfile,
  type GoalSeedLine,
  type GoalsState,
} from "@/entities/goal";

export {
  PREFERENCES_SEED,
  type AllocationsBandFilter,
  type AllocationsMatrixColumnSort,
  type NetWorthMonthSnapshot,
  type Preferences,
} from "@/entities/preferences";

