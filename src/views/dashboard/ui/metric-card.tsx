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
    <Card className="relative flex h-full min-h-0 flex-col overflow-hidden p-3">
      {highlight ? (
        <div className="absolute right-0 top-0 h-12 w-12 rounded-bl-full bg-secondary/10" />
      ) : null}
      <div
        className={cn(
          "mb-1.5 flex items-center gap-1.5",
          highlight ? "text-secondary" : "text-on-surface-variant",
        )}
      >
        <MaterialIcon name={icon} size={16} />
        <h4 className="font-label-sm text-label-sm uppercase">{label}</h4>
      </div>
      <div
        className={cn(
          "font-data-tabular text-body-lg font-semibold leading-snug tracking-tight tabular-nums",
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
