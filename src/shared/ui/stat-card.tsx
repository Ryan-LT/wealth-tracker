import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { Card } from "@/shared/ui/kit/card";
import { Skeleton } from "@/shared/ui/kit/skeleton";

type StatCardProps = {
  label: string;
  /** Usually `<Money compact />`. */
  value: ReactNode;
  icon?: LucideIcon;
  /** One line under the value. */
  hint?: ReactNode;
  /** Right side of the hint row (e.g. a delta badge). */
  aside?: ReactNode;
  href?: string;
  loading?: boolean;
  className?: string;
};

/** KPI tile with a single fixed type scale. */
export function StatCard({ label, value, icon: Icon, hint, aside, href, loading, className }: StatCardProps) {
  const body = (
    <Card
      className={cn(
        "h-full gap-2 px-4 py-4",
        href && "transition-colors hover:border-foreground/20 hover:bg-accent/30",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden /> : null}
      </div>
      <div className="text-xl leading-tight font-semibold tracking-tight md:text-2xl">
        {loading ? <Skeleton className="h-7 w-28" /> : value}
      </div>
      {hint || aside ? (
        <div className="flex min-h-4 items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="min-w-0 truncate">{hint}</span>
          {aside}
        </div>
      ) : null}
    </Card>
  );
  if (!href) return body;
  return (
    <Link href={href} className="block rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
      {body}
    </Link>
  );
}

/** Responsive KPI row: 2 columns on phones, up to 4 on desktop. */
export function StatGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4", className)}>{children}</div>;
}
