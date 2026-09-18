import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatVnd } from "@/shared/lib";

import { InstantPoolLeftCard } from "./instant-pool-left-card";
import { NetWorthHeroCard } from "./net-worth-hero-card";

type DashboardAtAGlanceProps = {
  netWorth: number;
  instantPoolLeft: number;
  monthlyNet: number;
  eoyProjection: number;
};

export function DashboardAtAGlance({
  netWorth,
  instantPoolLeft,
  monthlyNet,
  eoyProjection,
}: DashboardAtAGlanceProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NetWorthHeroCard netWorth={netWorth} />
      <InstantPoolLeftCard amount={instantPoolLeft} />
      <Card variant="primary" className="h-full">
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Monthly net
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              "text-2xl font-bold font-data-tabular tabular-nums tracking-tight leading-8",
              monthlyNet >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive",
            )}
          >
            {formatVnd(monthlyNet)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground leading-4">
            Income − average spending
          </p>
        </CardContent>
      </Card>
      <Card variant="secondary" className="h-full">
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            EOY projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold font-data-tabular tabular-nums tracking-tight leading-8">
            {formatVnd(eoyProjection)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground leading-4">
            Based on current trajectory
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
