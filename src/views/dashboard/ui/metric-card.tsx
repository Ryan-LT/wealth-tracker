import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib";
import { MaterialIcon } from "@/shared/ui";

type MetricCardProps = {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  negative?: boolean;
  highlight?: boolean;
  loading?: boolean;
};

export function MetricCard({
  icon,
  label,
  value,
  hint,
  negative = false,
  highlight = false,
  loading = false,
}: MetricCardProps) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 p-4 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <MaterialIcon
          name={icon}
          size={16}
          className={cn(
            "text-muted-foreground",
            highlight && "text-chart-2",
          )}
        />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div
          className={cn(
            "text-2xl font-bold font-data-tabular tabular-nums tracking-tight leading-8",
            negative && "text-destructive",
          )}
        >
          {loading ? <Skeleton className="h-7 w-32" /> : value}
        </div>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground leading-4">
            {loading ? <Skeleton className="h-3 w-28" /> : hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
