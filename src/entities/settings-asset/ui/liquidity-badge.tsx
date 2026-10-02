import { useI18n } from "@/shared/i18n";
import { resolveSettingsAssetLiquidity, type SettingsAssetLiquidity } from "@/entities/settings-asset/model";
import { StatusBadge } from "@/shared/ui/status-badge";

/** Instant (cash-like) vs not instant (locked) access. */
export function LiquidityBadge({ liquidity, className }: { liquidity: SettingsAssetLiquidity | undefined; className?: string }) {
  const instant = resolveSettingsAssetLiquidity(liquidity) === "instant";
  const { t } = useI18n();
  return (
    <StatusBadge tone={instant ? "success" : "warning"} dot className={className}>
      {instant ? t.domain.liquidity.instant : t.domain.liquidity.notInstant}
    </StatusBadge>
  );
}
