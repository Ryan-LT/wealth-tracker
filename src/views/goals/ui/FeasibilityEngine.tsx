import { formatVnd } from "@/shared/lib";
import { Badge, Card, MaterialIcon } from "@/shared/ui";

type FeasibilityEngineProps = {
  requiredMonthly: number;
  currentRate: number;
  /** Optional context line at the bottom (e.g. "...on track to reach this goal 3 months early."). */
  note?: string;
};

export function FeasibilityEngine({
  requiredMonthly,
  currentRate,
  note,
}: FeasibilityEngineProps) {
  const onTrack = currentRate >= requiredMonthly;

  return (
    <Card className="p-stack-md">
      <div className="flex items-center justify-between border-b border-outline-variant pb-2 mb-4">
        <h3 className="text-headline-md font-headline-md text-on-surface">Feasibility Engine</h3>
        <MaterialIcon
          name={onTrack ? "check_circle" : "error"}
          className={onTrack ? "text-secondary" : "text-error"}
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-body-md font-body-md text-on-surface-variant">Status</span>
          <Badge tone="active">{onTrack ? "On Track" : "At Risk"}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-body-md font-body-md text-on-surface-variant">
            Req. Monthly Savings
          </span>
          <span className="text-data-tabular font-data-tabular text-on-surface">
            {formatVnd(requiredMonthly)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-body-md font-body-md text-on-surface-variant">
            Current Savings Rate
          </span>
          <span className="text-data-tabular font-data-tabular text-secondary">
            {formatVnd(currentRate)}
          </span>
        </div>
        {note ? (
          <div className="mt-2 text-label-sm font-label-sm text-on-surface-variant bg-surface-container-low p-2 rounded">
            {note}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
