import type { HTMLAttributes, ReactNode } from "react";

import { Card as ShadcnCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "section";
  children?: ReactNode;
};

export function Card({ className, variant: _variant, children, ...rest }: CardProps) {
  return (
    <ShadcnCard className={cn("gap-0 py-0", className)} {...rest}>
      {children}
    </ShadcnCard>
  );
}

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  end?: ReactNode;
  className?: string;
};

export function SectionHeader({ title, subtitle, end, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex items-end justify-between gap-4 border-b border-border pb-4",
        className,
      )}
    >
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {end ? <div className="text-right">{end}</div> : null}
    </div>
  );
}
