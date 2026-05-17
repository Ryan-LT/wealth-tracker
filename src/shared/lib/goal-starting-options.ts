import {
  resolveSettingsAssetLiquidity,
  type AssetsState,
  type SettingsAsset,
  type SettingsAssetLiquidity,
} from "@/shared/storage";

export type GoalStartingOption = {
  key: string;
  label: string;
  /** Balance in ₫; ignored when `isCustom` (use the `GoalSeedLine.amount` for that row). */
  amount: number;
  isCustom?: boolean;
  /**
   * Settings catalog category — shown as a badge next to the option label in the
   * Goal Plan starting-balance list and add-source picker.
   */
  category?: string;
  /**
   * Liquidity band for this source — `"instant"` (cash & instant-tagged catalog) or
   * `"not_instant"` (real estate, investments, not-instant catalog). Undefined for
   * `none` / `custom` rows.
   */
  liquidity?: SettingsAssetLiquidity;
};

/**
 * Build picker rows for "starting balance" toward a goal: portfolio detail lines,
 * settings catalog lines, none, and custom.
 */
export function buildGoalStartingOptions(
  assets: AssetsState,
  catalog: SettingsAsset[],
): GoalStartingOption[] {
  const rows: GoalStartingOption[] = [
    { key: "none", label: "No starting balance (0 ₫)", amount: 0 },
  ];

  for (const p of assets.realEstate) {
    rows.push({
      key: `re:${p.id}`,
      label: `Real estate — ${p.name}`,
      amount: p.estValue,
      liquidity: "not_instant",
    });
  }
  for (const c of assets.cashAccounts) {
    const title = c.details?.trim() || c.category || "Cash account";
    rows.push({
      key: `cash:${c.id}`,
      label: `Cash — ${title}`,
      amount: c.balance,
      liquidity: "instant",
    });
  }
  for (const i of assets.investments) {
    rows.push({
      key: `inv:${i.id}`,
      label: `Investment — ${i.name}`,
      amount: i.value,
      liquidity: "not_instant",
    });
  }
  for (const a of catalog) {
    rows.push({
      key: `catalog:${a.id}`,
      label: a.name,
      amount: a.currentValue,
      category: a.category?.trim() || undefined,
      liquidity: resolveSettingsAssetLiquidity(a.liquidity),
    });
  }

  rows.push({ key: "custom", label: "Custom starting balance…", amount: 0, isCustom: true });

  return rows;
}
