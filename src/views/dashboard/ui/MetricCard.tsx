import { cn } from "@/shared/lib";
import { Card, MaterialIcon } from "@/shared/ui";

type MetricCardProps = {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  /** Highlight value with the error color (used for "Total Debt"). */
  negative?: boolean;
  /** Render the corner secondary tint (used on the EOY Projection card). */
  highlight?: boolean;
};

export function MetricCard({
  icon,
  label,
  value,
  hint,
  negative = false,
  highlight = false,
}: MetricCardProps) {
  return (
    <Card className="p-4 flex flex-col relative overflow-hidden">
      {highlight ? (
        <div className="absolute right-0 top-0 w-16 h-16 bg-secondary/10 rounded-bl-full" />
      ) : null}
      <div
        className={cn(
          "flex items-center gap-2 mb-2",
          highlight ? "text-secondary" : "text-on-surface-variant",
        )}
      >
        <MaterialIcon name={icon} size={18} />
        <h4 className="font-label-sm text-label-sm uppercase">{label}</h4>
      </div>
      <div
        className={cn(
          "font-headline-md text-headline-md",
          negative ? "text-error" : "text-primary",
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className="font-data-tabular text-data-tabular text-on-surface-variant text-xs mt-1">
          {hint}
        </div>
      ) : null}
    </Card>
  );
}
