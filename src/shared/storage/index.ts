export { readTable, writeTable, useTable } from "./store";

export { TABLE_KEYS, isTableKey, type TableKey } from "./table-keys";

export { ASSETS_SEED } from "./assets";
export type { AssetsState, RealEstateProperty, CashAccount, Investment } from "./assets";

export { DEBTS_SEED } from "./debts";
export type { Debt } from "./debts";

export { INCOME_SOURCES_SEED, SETTINGS_ASSETS_SEED } from "./income-sources";
export type {
  IncomeSource,
  IncomeSourceKind,
  SettingsAsset,
  SettingsAssetLiquidity,
} from "./income-sources";
export {
  SETTINGS_ASSET_LIQUIDITY_DEFAULT,
  resolveSettingsAssetLiquidity,
  settingsAssetLiquidityLabel,
} from "./income-sources";

export {
  EMPTY_GOAL_PROFILE,
  GOALS_SEED,
  GOAL_PLAN_NEW_SENTINEL,
  GOAL_SIMULATOR_NEW_SENTINEL,
  goalProfileForDashboard,
} from "./goals";
export type { GoalsState, GoalProfile, GoalSeedLine, GoalCheckpoint } from "./goals";

export { PREFERENCES_SEED } from "./preferences";
export type { Preferences, NetWorthMonthSnapshot } from "./preferences";

export { PERSONAL_LOANS_SEED } from "./personal-loans";
export type {
  PersonalLoan,
  PersonalLoanDirection,
  PersonalLoanStatus,
} from "./personal-loans";
