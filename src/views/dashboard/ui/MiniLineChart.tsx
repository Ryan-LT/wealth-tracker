/**
 * Net worth trend area — empty until time-series data exists in the app.
 */
export function MiniLineChart() {
  return (
    <div
      className="flex h-48 w-full flex-col items-center justify-center border-b border-l border-outline-variant bg-surface-container-low/30"
      role="img"
      aria-label="Net worth history"
    >
      <p className="px-4 text-center font-body-md text-body-md text-on-surface-variant">
        Add accounts and check back — net worth history will appear here.
      </p>
    </div>
  );
}
