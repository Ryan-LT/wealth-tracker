/**
 * Reproduces the minimal SVG line chart used on the Executive Dashboard:
 * a polyline trend on top of a soft secondary-tinted gradient, with monthly
 * x-axis labels underneath.
 */

const POINTS = "0,80 20,70 40,75 60,40 80,45 100,20";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] as const;

export function MiniLineChart() {
  return (
    <>
      <div className="h-48 w-full border-b border-l border-outline-variant relative flex items-end">
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/10 to-transparent" />
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <polyline
            fill="none"
            points={POINTS}
            stroke="var(--color-secondary)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="flex justify-between mt-2 font-data-tabular text-data-tabular text-on-surface-variant text-[10px]">
        {MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </>
  );
}
