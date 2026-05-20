import type { SettingsAsset } from "../model";

/** Sum of line items from Settings → Asset Management (flat catalog). */
export function totalSettingsAssetsValue(items: SettingsAsset[]): number {
  return items.reduce((s, a) => s + Math.max(0, a.currentValue), 0);
}
