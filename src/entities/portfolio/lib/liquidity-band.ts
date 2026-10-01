import type { StatusTone } from "@/shared/lib/tone";

import type { LiquidityBand } from "./allocation-report";

export function liquidityBandLabel(band: LiquidityBand): string {
  switch (band) {
    case "instant":
      return "Instant access";
    case "not_instant":
      return "Not instant";
    case "custom":
      return "Custom model";
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
