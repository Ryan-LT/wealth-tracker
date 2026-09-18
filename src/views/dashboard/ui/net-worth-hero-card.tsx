import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatVnd } from "@/shared/lib";

type NetWorthHeroCardProps = {
  netWorth: number;
};

export function NetWorthHeroCard({ netWorth }: NetWorthHeroCardProps) {
  return (
    <Card variant="hero" className="h-full">
      <CardHeader>
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-[var(--surface-hero-muted)]">
          Net worth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold font-data-tabular tabular-nums tracking-tight leading-8">
          {formatVnd(netWorth)}
        </p>
        <p className="mt-2 text-xs hero-caption leading-4">Assets − liabilities</p>
      </CardContent>
    </Card>
  );
}
