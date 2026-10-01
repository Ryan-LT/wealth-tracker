import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  /** Primary actions; right-aligned on desktop. */
  actions?: ReactNode;
  /** Small line under the title (badges, dates). */
  meta?: ReactNode;
  className?: string;
};

/**
 * Page title block. On phones the top bar already shows the title, so the
 * heading is visually hidden there to save vertical space.
 */
export function PageHeader({ title, description, actions, meta, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight max-md:sr-only">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground md:mt-1">{description}</p> : null}
        {meta ? <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
