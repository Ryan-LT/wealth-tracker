import { Card, CardContent, CardHeader, CardTitle, type CardVariant } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib";
import { MaterialIcon } from "@/shared/ui";

export type MetricVariant = "primary" | "secondary" | "outflow" | "quiet";

type MetricCardProps = {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  variant?: MetricVariant;
  negative?: boolean;
  highlight?: boolean;
  loading?: boolean;
};

const iconWellClass: Record<MetricVariant, string> = {
  primary: "bg-[color-mix(in_oklch,var(--accent-blue)_16%,white)] text-[var(--accent-blue)]",
  secondary: "bg-[var(--surface-secondary-icon)] text-[var(--accent-orange)]",
  outflow: "bg-[var(--surface-outflow-icon)] text-destructive",
  quiet: "bg-muted text-muted-foreground",
};

export function MetricCard({
  icon,
  label,
  value,
  hint,
  variant = "quiet",
  negative = false,
  highlight = false,
  loading = false,
}: MetricCardProps) {
  const isPrimary = variant === "primary";
  const cardVariant: CardVariant = variant;

  return (
    <Card variant={cardVariant} className="min-w-0 w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3 pb-3">
        <CardTitle
          className={cn(
            "min-w-0 flex-1 text-sm font-medium leading-snug",
            isPrimary ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
        </CardTitle>
        <span
          className={cn(
            "icon-well mt-0.5",
            iconWellClass[variant],
            highlight && variant === "quiet" && "bg-[color-mix(in_oklch,var(--accent-green)_16%,white)] text-[var(--accent-green)]",
          )}
        >
          <MaterialIcon name={icon} size={18} />
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          className={cn(
            "max-w-full min-w-0 overflow-x-auto font-bold font-data-tabular tabular-nums tracking-tight leading-tight [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            isPrimary
              ? "text-[1.125rem] sm:text-xl md:text-2xl text-foreground"
              : "text-base sm:text-lg md:text-xl",
            negative && "text-destructive",
            !negative && variant === "secondary" && "text-foreground/95",
          )}
        >
          {loading ? <Skeleton className="h-7 w-32" /> : value}
        </div>
        {hint ? (
          <p className="mt-1.5 text-xs text-muted-foreground leading-4">
            {loading ? <Skeleton className="h-3 w-28" /> : hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
