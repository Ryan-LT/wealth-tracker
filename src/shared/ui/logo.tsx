import { BRAND } from "@/shared/config/brand";
import { cn } from "@/shared/lib/cn";

type LogoProps = {
  size?: number;
  className?: string;
  decorative?: boolean;
  "aria-label"?: string;
};

/**
 * The Cairn mark: three stacked stones (base, middle, capstone) on an indigo
 * tile. Brand colours are fixed so the mark looks the same in both themes.
 */
export function Logo({ size = 32, className, decorative = false, "aria-label": ariaLabel = BRAND.name }: LogoProps) {
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
      <rect width="32" height="32" rx="8" fill="#5b5bd6" />
      <rect x="6.5" y="20" width="19" height="5.5" rx="2.75" fill="#ffffff" />
      <rect x="9.5" y="13.6" width="13" height="5.2" rx="2.6" fill="#dcdcf7" transform="rotate(-5 16 16.2)" />
      <rect x="12.6" y="7.4" width="7.4" height="5" rx="2.5" fill="#f4b860" transform="rotate(6 16.3 9.9)" />
    </svg>
  );
}
