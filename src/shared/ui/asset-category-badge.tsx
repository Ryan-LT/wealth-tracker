import type { ReactNode } from "react";

import { cn } from "@/shared/lib";
import {
  assetCategoryBadgeClassNames,
  resolveAssetCategoryEmoji,
} from "@/shared/config/asset-categories";

export type AssetCategoryBadgeProps = {
  category: string;
  /** Defaults to the trimmed category label. */
  children?: ReactNode;
  className?: string;
};

export function AssetCategoryBadge({
  category,
  children,
  className,
}: AssetCategoryBadgeProps) {
  const emoji = resolveAssetCategoryEmoji(category);
  const label = children ?? category.trim();

  return (
    <span
      className={cn(assetCategoryBadgeClassNames(category), className)}
      title={typeof label === "string" ? label : undefined}
    >
      <span
        className="shrink-0 text-[1.125em] leading-none"
        aria-hidden
      >
        {emoji}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </span>
  );
}
