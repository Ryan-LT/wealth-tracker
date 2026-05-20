import type { AssetsState } from "@/entities/asset/model";

export function totalAssetValue(assets: AssetsState): number {
  const realEstate = assets.realEstate.reduce((s, p) => s + p.estValue, 0);
  const cash = assets.cashAccounts.reduce((s, a) => s + a.balance, 0);
  const investments = assets.investments.reduce((s, i) => s + i.value, 0);
  return realEstate + cash + investments;
}
