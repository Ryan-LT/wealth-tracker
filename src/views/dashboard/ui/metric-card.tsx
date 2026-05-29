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

const variantIcon: Record<MetricVariant, string> = {
  primary: "text-chart-2",
  secondary: "text-chart-4/90",
  outflow: "text-destructive/85",
  quiet: "text-muted-foreground",
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
    <Card
      variant={cardVariant}
      className={cn("min-w-[9.5rem] flex-1", isPrimary && "min-w-[11rem]")}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-3">
        <CardTitle
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wider",
            isPrimary ? "text-foreground/85" : "text-muted-foreground",
          )}
        >
          {label}
        </CardTitle>
        <MaterialIcon
          name={icon}
          size={16}
          className={cn(
            variantIcon[variant],
            highlight && variant === "quiet" && "text-chart-2",
          )}
        />
      </CardHeader>
      <CardContent className="pt-0">
        <div
          className={cn(
            "font-bold font-data-tabular tabular-nums tracking-tight leading-8",
            isPrimary ? "text-2xl text-foreground" : "text-xl",
            negative && "text-destructive",
            !negative && variant === "secondary" && "text-foreground/95",
          )}
        >
          {loading ? <Skeleton className="h-7 w-32" /> : value}
        </div>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground/90 leading-4">
            {loading ? <Skeleton className="h-3 w-28" /> : hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
