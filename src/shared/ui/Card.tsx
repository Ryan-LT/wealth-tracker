import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Use rounded-xl by default; pass `rounded-DEFAULT` etc. via className to override. */
  variant?: "default" | "section";
  children?: ReactNode;
};

/**
 * The neutral card surface used everywhere in the design system:
 *   bg-surface-container-lowest + 1px outline-variant border + soft elevation.
 *
 * `variant="section"` matches the slightly-flatter "section" cards on the
 * Asset & Debt Tracker page (rounded-DEFAULT instead of rounded-xl).
 */
export function Card({ className, variant = "default", children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-lowest border border-outline-variant card-elevation",
        variant === "default" ? "rounded-xl" : "rounded-DEFAULT",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  /** Right-side block — typically a "Total Value" or filter dropdown. */
  end?: ReactNode;
  className?: string;
};

/**
 * The section card header pattern used across Asset & Debt Tracker and Settings:
 *   <h3>title</h3><p>SUBTITLE</p>      ...end
 *   ───────────────────────────────────────────
 */
export function SectionHeader({ title, subtitle, end, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex justify-between items-end border-b border-surface-container-high pb-4 mb-6 gap-4",
        className,
      )}
    >
      <div>
        <h3 className="text-headline-md font-headline-md text-primary tracking-tight">{title}</h3>
        {subtitle ? (
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 uppercase tracking-wider">
            {subtitle}
          </p>
        ) : null}
      </div>
      {end ? <div className="text-right">{end}</div> : null}
    </div>
  );
}
