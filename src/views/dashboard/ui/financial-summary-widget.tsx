import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatVnd } from "@/shared/lib";

type FinancialSummaryWidgetProps = {
  totalAssets: number;
  totalLiabilities: number;
  portfolioDetailTotal: number;
  assetConfigurationTotal: number;
};

export function FinancialSummaryWidget({
  totalAssets,
  totalLiabilities,
  portfolioDetailTotal,
  assetConfigurationTotal,
}: FinancialSummaryWidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Financial summary
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <Row label="Asset configuration" value={formatVnd(assetConfigurationTotal)} />
        <Row label="Portfolio detail" value={formatVnd(portfolioDetailTotal)} />
        <Separator />
        <Row label="Total assets" value={formatVnd(totalAssets)} emphasized />
        <Row label="Liabilities" value={`−${formatVnd(totalLiabilities)}`} destructive />
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  emphasized,
  destructive,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={emphasized ? "font-medium text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span
        className={[
          "font-data-tabular tabular-nums shrink-0",
          emphasized ? "font-semibold text-foreground" : "font-medium",
          destructive ? "text-destructive" : "",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}
