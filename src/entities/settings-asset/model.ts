/** How quickly catalog asset value can be accessed (withdraw / spend). */
export type SettingsAssetLiquidity = "instant" | "not_instant";

export type SettingsAsset = {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  /**
   * Liquidity / access speed. Omitted in older saves — treat as
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

export const SETTINGS_ASSET_LIQUIDITY_DEFAULT: SettingsAssetLiquidity = "instant";
