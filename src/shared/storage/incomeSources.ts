export type IncomeSourceKind = "active" | "passive";

export type IncomeSource = {
  id: string;
  kind: IncomeSourceKind;
  name: string;
  details: string;
  icon: string;
  monthly: number;
  /** "Active" / "Passive" badge for the Settings page; payment day-of-month. */
  paymentDay?: number;
  paymentEntity?: string;
};

export const INCOME_SOURCES_SEED: IncomeSource[] = [];

/** How quickly catalog asset value can be accessed (withdraw / spend). */
export type SettingsAssetLiquidity = "instant" | "not_instant";

export type SettingsAsset = {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  /**
   * Liquidity / access speed. Omitted in older localStorage saves — treat as
   * {@link resolveSettingsAssetLiquidity} default.
   */
  liquidity?: SettingsAssetLiquidity;
};

export const SETTINGS_ASSETS_SEED: SettingsAsset[] = [];

export function resolveSettingsAssetLiquidity(
  value: SettingsAsset["liquidity"],
): SettingsAssetLiquidity {
  return value === "not_instant" ? "not_instant" : "instant";
}

export function settingsAssetLiquidityLabel(
  value: SettingsAsset["liquidity"],
): "Instant" | "Not instant" {
  return resolveSettingsAssetLiquidity(value) === "instant"
    ? "Instant"
    : "Not instant";
}

export const SETTINGS_ASSET_LIQUIDITY_DEFAULT: SettingsAssetLiquidity =
  "instant";
