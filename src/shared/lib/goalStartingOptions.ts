import type { AssetsState, SettingsAsset } from "@/shared/storage";

export type GoalStartingOption = {
  key: string;
  label: string;
  /** Balance in ₫; ignored when `isCustom` (use the `GoalSeedLine.amount` for that row). */
  amount: number;
  isCustom?: boolean;
};

/**
 * Build picker rows for "starting balance" toward a goal: tracker holdings,
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
    });
  }
  for (const c of assets.cashAccounts) {
    const title = c.details?.trim() || c.category || "Cash account";
    rows.push({
      key: `cash:${c.id}`,
      label: `Cash — ${title}`,
      amount: c.balance,
    });
  }
  for (const i of assets.investments) {
    rows.push({
      key: `inv:${i.id}`,
      label: `Investment — ${i.name}`,
      amount: i.value,
    });
  }
  for (const a of catalog) {
    rows.push({
      key: `catalog:${a.id}`,
      label: `Catalog — ${a.name}`,
      amount: a.currentValue,
    });
  }

  rows.push({ key: "custom", label: "Custom starting balance…", amount: 0, isCustom: true });

  return rows;
}
