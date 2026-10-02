import { activeMessages } from "@/shared/i18n/active";
import type { StatusTone } from "@/shared/lib/tone";

import type { LiquidityBand } from "./allocation-report";

export function liquidityBandLabel(band: LiquidityBand): string {
  const m = activeMessages().domain.liquidity;
  switch (band) {
    case "instant":
      return m.bandInstant;
    case "not_instant":
      return m.bandNotInstant;
    case "custom":
      return m.bandCustom;
    default:
      return "—";
  }
}

export function liquidityBandTone(band: LiquidityBand): StatusTone {
  switch (band) {
    case "instant":
      return "success";
    case "not_instant":
      return "warning";
    default:
      return "neutral";
  }
}
