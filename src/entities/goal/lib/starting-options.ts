import { activeMessages } from "@/shared/i18n/active";
import type { AssetsState } from "@/entities/asset";
import {
  resolveSettingsAssetLiquidity,
  type SettingsAsset,
  type SettingsAssetLiquidity,
} from "@/entities/settings-asset";

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
  const m = activeMessages().domain.startingOptions;
  const rows: GoalStartingOption[] = [
    { key: "none", label: m.none, amount: 0 },
  ];

  for (const p of assets.realEstate) {
    rows.push({
      key: `re:${p.id}`,
      label: m.realEstate({ name: p.name }),
      amount: p.estValue,
      liquidity: "not_instant",
    });
  }
  for (const c of assets.cashAccounts) {
    const title = c.details?.trim() || c.category || m.cashFallback;
    rows.push({
      key: `cash:${c.id}`,
      label: m.cash({ name: title }),
      amount: c.balance,
      liquidity: "instant",
    });
  }
  for (const i of assets.investments) {
    rows.push({
      key: `inv:${i.id}`,
      label: m.investment({ name: i.name }),
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

  rows.push({ key: "custom", label: m.custom, amount: 0, isCustom: true });

  return rows;
}
