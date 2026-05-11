export { readTable, writeTable, useTable } from "./store";

export { ASSETS_SEED } from "./assets";
export type { AssetsState, RealEstateProperty, CashAccount, Investment } from "./assets";

export { DEBTS_SEED } from "./debts";
export type { Debt } from "./debts";

export { INCOME_SOURCES_SEED, SETTINGS_ASSETS_SEED } from "./incomeSources";
export type {
  IncomeSource,
  IncomeSourceKind,
  SettingsAsset,
  SettingsAssetLiquidity,
} from "./incomeSources";
export {
  SETTINGS_ASSET_LIQUIDITY_DEFAULT,
  resolveSettingsAssetLiquidity,
  settingsAssetLiquidityLabel,
} from "./incomeSources";

export {
  EMPTY_GOAL_PROFILE,
  GOALS_SEED,
  GOAL_PLAN_NEW_SENTINEL,
  GOAL_SIMULATOR_NEW_SENTINEL,
  goalProfileForDashboard,
} from "./goals";
export type { GoalsState, GoalProfile, GoalSeedLine } from "./goals";

export { PREFERENCES_SEED } from "./preferences";
export type { Preferences, NetWorthMonthSnapshot } from "./preferences";
