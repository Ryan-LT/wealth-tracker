import { cn } from "@/shared/lib";

type WealthTrackerLogoProps = {
  /** Pixel width and height of the mark (square). */
  size?: number;
  className?: string;
  /**
   * When true, hides the mark from assistive tech (use beside a visible "WealthTracker" title).
   */
  decorative?: boolean;
  /** Short label when `decorative` is false. */
  "aria-label"?: string;
};

/**
 * Brand mark: rounded tile with an upward wealth trend — matches `app/icon.svg`.
 */
export function WealthTrackerLogo({
  size = 32,
  className,
  decorative = false,
  "aria-label": ariaLabel = "WealthTracker",
}: WealthTrackerLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="img"
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : ariaLabel}
    >
      <rect width="32" height="32" rx="8" fill="#006C49" />
      <path
        d="M7 23 L12 17 L17 20 L25 9"
        stroke="#ffffff"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="9" r="2.25" fill="#ffffff" />
    </svg>
  );
}
