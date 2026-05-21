import { cn } from "@/shared/lib";

type WealthTrackerLogoProps = {
  size?: number;
  className?: string;
  decorative?: boolean;
  "aria-label"?: string;
};

export function WealthTrackerLogo({
  size = 32,
  className,
  decorative = false,
  "aria-label": ariaLabel = "Wealth Tracker",
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
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M7 23 L12 17 L17 20 L25 9"
        className="stroke-primary-foreground"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="25" cy="9" r="2.25" className="fill-primary-foreground" />
    </svg>
  );
}
