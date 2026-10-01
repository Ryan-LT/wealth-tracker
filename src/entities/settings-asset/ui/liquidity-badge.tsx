import { resolveSettingsAssetLiquidity, type SettingsAssetLiquidity } from "@/entities/settings-asset/model";
import { StatusBadge } from "@/shared/ui/status-badge";

/** Instant (cash-like) vs not instant (locked) access. */
export function LiquidityBadge({ liquidity, className }: { liquidity: SettingsAssetLiquidity | undefined; className?: string }) {
  const instant = resolveSettingsAssetLiquidity(liquidity) === "instant";
  return (
    <StatusBadge tone={instant ? "success" : "warning"} dot className={className}>
      {instant ? "Instant" : "Not instant"}
    </StatusBadge>
  );
}
