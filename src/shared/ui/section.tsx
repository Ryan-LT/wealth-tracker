import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/kit/card";

type SectionProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Edge-to-edge content (tables, lists): no side padding, no bottom padding. */
  flush?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

/** A titled card — the standard container for page sections. */
export function Section({ title, description, actions, flush, className, contentClassName, children }: SectionProps) {
  return (
    <Card className={cn(flush && "gap-0 overflow-hidden pb-0", className)}>
      <CardHeader className={cn(flush && "pb-4")}>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {actions ? <CardAction>{actions}</CardAction> : null}
      </CardHeader>
      <CardContent className={cn(flush && "border-t px-0", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
