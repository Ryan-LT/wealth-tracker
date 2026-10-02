import { ASSETS_SEED } from "@/entities/asset";
import { DEBTS_SEED } from "@/entities/debt";
import { GOALS_SEED } from "@/entities/goal";
import { INCOME_SOURCES_SEED } from "@/entities/income";
import { PERSONAL_LOANS_SEED } from "@/entities/personal-loan";
import { PREFERENCES_SEED } from "@/entities/preferences";
import { SETTINGS_ASSETS_SEED } from "@/entities/settings-asset";
import { todayIso } from "@/shared/lib/date";
import { readTable } from "@/shared/storage/store";
import type { TableKey } from "@/shared/storage/table-keys";

const SEEDS: Record<TableKey, unknown> = {
  assets: ASSETS_SEED,
  debts: DEBTS_SEED,
  settingsAssets: SETTINGS_ASSETS_SEED,
  incomeSources: INCOME_SOURCES_SEED,
  goals: GOALS_SEED,
  preferences: PREFERENCES_SEED,
  personalLoans: PERSONAL_LOANS_SEED,
};

/** Same shape as `GET /api/tables`, so a backup can be restored with one PUT. */
export function buildBackup(): { exportedAt: string; tables: Record<TableKey, unknown> } {
  const tables = {} as Record<TableKey, unknown>;
  for (const key of Object.keys(SEEDS) as TableKey[]) {
    tables[key] = readTable(key, SEEDS[key]);
  }
  return { exportedAt: new Date().toISOString(), tables };
}

export function downloadBackup(): void {
  const blob = new Blob([JSON.stringify(buildBackup(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cairn-backup-${todayIso()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
