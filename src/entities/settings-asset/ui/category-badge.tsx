import { assetCategoryLabel, resolveAssetCategoryEmoji } from "@/entities/settings-asset/config/categories";
import { cn } from "@/shared/lib/cn";

type CategoryBadgeProps = { category: string; className?: string };

/** Neutral chip with the category emoji. */
export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const label = assetCategoryLabel(category);
  return (
    <span
      title={label}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md border bg-card px-1.5 py-0.5 text-xs font-medium text-foreground",
        className,
      )}
    >
      <span aria-hidden className="leading-none">
        {resolveAssetCategoryEmoji(category)}
      </span>
      <span className="truncate">{label}</span>
    </span>
  );
}
