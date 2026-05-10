import { formatVnd } from "@/shared/lib";
import { Card } from "@/shared/ui";

type ProjectionTimelineChartProps = {
  targetAmount: number;
  /**
   * Position of the "today" amount expressed as a fraction of target (0..1).
   * The chart adapts its rising area path subtly based on this value.
   */
  progress: number;
};

export function ProjectionTimelineChart({
  targetAmount,
  progress,
}: ProjectionTimelineChartProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  // Higher current progress → flatter, faster-rising curve. Lower → steeper acceleration near target.
  const startY = 100 - clamped * 30;
  const midY = 75 - clamped * 35;
  const endY = 10 + (1 - clamped) * 5;

  const linePath = `M0,${startY} Q25,${midY} 50,50 T100,${endY}`;
  const areaPath = `M0,100 L0,${startY} Q25,${midY} 50,50 T100,${endY} L100,100 Z`;

  return (
    <Card className="p-stack-md flex-grow">
      <h3 className="text-headline-md font-headline-md text-on-surface border-b border-outline-variant pb-2 mb-4">
        Projection Timeline
      </h3>
      <div className="w-full h-64 bg-surface-container-low rounded border border-outline-variant flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-between py-4 px-8 opacity-20 pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-outline-variant w-full h-px" />
          ))}
        </div>
        <svg
          className="absolute inset-0 h-full w-full opacity-50"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <path d={areaPath} fill="var(--color-secondary-container)" />
          <path
            d={linePath}
            fill="none"
            stroke="var(--color-secondary)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="absolute top-10 left-0 right-0 border-t-2 border-dashed border-error opacity-50 z-10" />
        <span className="absolute top-4 right-4 text-label-sm font-label-sm text-error bg-surface-container-lowest px-1 rounded z-10">
          Target: {formatVnd(targetAmount)}
        </span>
        <span className="text-on-surface-variant font-body-md z-10 bg-surface-container-lowest/80 px-2 py-1 rounded">
          Interactive Chart Area
        </span>
      </div>
      <div className="flex justify-between mt-2 text-label-sm font-label-sm text-on-surface-variant px-8">
        <span>Today</span>
        <span>Year 1</span>
        <span>Year 2</span>
        <span>Year 3</span>
        <span>Target</span>
      </div>
    </Card>
  );
}
