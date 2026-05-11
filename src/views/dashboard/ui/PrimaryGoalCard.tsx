import { formatVnd } from "@/shared/lib";
import { Card } from "@/shared/ui";

type PrimaryGoalCardProps = {
  name: string;
  targetAmount: number;
  saved: number;
};

/** Circular ring progress — matches `executive_dashboard_vnd_updated_nav/code.html`. */
function GoalRing({ percent }: { percent: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = c - (clamped / 100) * c;

  return (
    <div className="relative flex flex-1 items-center justify-center py-2">
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 128 128"
          aria-hidden
        >
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke="var(--color-surface-container-highest)"
            strokeWidth="8"
          />
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke="var(--color-secondary)"
            strokeWidth="8"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="relative z-10 font-headline-md text-headline-md text-primary">
          {percent}%
        </span>
      </div>
    </div>
  );
}

export function PrimaryGoalCard({ name, targetAmount, saved }: PrimaryGoalCardProps) {
  const pct =
    targetAmount === 0 ? 0 : Math.round((saved / targetAmount) * 100);

  return (
    <Card className="p-6 flex flex-col">
      <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-stack-md border-b border-outline-variant/50 pb-2">
        Primary Goal
      </h3>
      <div className="font-headline-md text-headline-md text-primary mb-1">{name}</div>
      <div className="font-data-tabular text-data-tabular text-on-surface-variant mb-stack-lg">
        Target: {formatVnd(targetAmount)}
      </div>
      <GoalRing percent={pct} />
      <div className="mt-stack-md text-center font-data-tabular text-data-tabular text-primary">
        {formatVnd(saved)} Saved
      </div>
    </Card>
  );
}
