import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatVnd } from "@/shared/lib";

type InstantPoolLeftCardProps = {
  amount: number;
};

/** Renders from local cache immediately — no hydration skeleton. */
export function InstantPoolLeftCard({ amount }: InstantPoolLeftCardProps) {
  return (
    <Card variant="primary" className="h-full">
      <CardHeader>
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Instant pool left
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold font-data-tabular tabular-nums tracking-tight leading-8 text-emerald-600 dark:text-emerald-400">
          {formatVnd(amount)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground leading-4">
          Uncommitted capacity on instant-tagged sources
        </p>
      </CardContent>
    </Card>
  );
}
