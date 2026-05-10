import { formatVnd } from "@/shared/lib";
import { Card } from "@/shared/ui";

type PrimaryGoalCardProps = {
  name: string;
  targetAmount: number;
  saved: number;
};

/**
 * Diamond-shaped goal progress visualization that mirrors the screenshot:
 * a 12px-rounded square rotated 45° as the track, with a thicker green ring
 * inside indicating progress. The percentage label sits in the upright center.
 */
function GoalDiamond({ percent }: { percent: number }) {
  return (
    <div className="flex-1 flex items-center justify-center relative py-2">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div
          className="absolute inset-0 border-8 border-surface-container-highest"
          style={{ borderRadius: "0.75rem", transform: "rotate(45deg)" }}
        />
        <div
          className="absolute inset-0 border-8 border-secondary"
          style={{ borderRadius: "0.75rem", transform: "rotate(45deg)" }}
        />
        <div className="text-center relative z-10">
          <span className="block font-headline-md text-headline-md text-primary">
            {percent}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function PrimaryGoalCard({ name, targetAmount, saved }: PrimaryGoalCardProps) {
  const pct = Math.round((saved / targetAmount) * 100);

  return (
    <Card className="p-6 flex flex-col">
      <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-stack-md border-b border-outline-variant/50 pb-2">
        Primary Goal
      </h3>
      <div className="font-headline-md text-headline-md text-primary mb-1">{name}</div>
      <div className="font-data-tabular text-data-tabular text-on-surface-variant mb-stack-lg">
        Target: {formatVnd(targetAmount)}
      </div>
      <GoalDiamond percent={pct} />
      <div className="mt-stack-md text-center font-data-tabular text-data-tabular text-primary">
        {formatVnd(saved)} Saved
      </div>
    </Card>
  );
}
