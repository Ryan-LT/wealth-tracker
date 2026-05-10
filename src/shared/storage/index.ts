export { readTable, writeTable, useTable } from "./store";

export { ASSETS_SEED } from "./assets";
export type { AssetsState, RealEstateProperty, CashAccount, Investment } from "./assets";

export { DEBTS_SEED } from "./debts";
export type { Debt } from "./debts";

export { TRANSACTIONS_SEED, ACTIVITY_SEED } from "./transactions";
export type { Transaction, ActivityRow } from "./transactions";

export { INCOME_SOURCES_SEED, SETTINGS_ASSETS_SEED } from "./incomeSources";
export type { IncomeSource, IncomeSourceKind, SettingsAsset } from "./incomeSources";

export { EMPTY_GOAL_PROFILE, GOALS_SEED } from "./goals";
export type { GoalsState, GoalProfile } from "./goals";

export { PREFERENCES_SEED } from "./preferences";
export type { Preferences } from "./preferences";
