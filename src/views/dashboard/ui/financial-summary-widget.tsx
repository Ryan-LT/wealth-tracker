import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatVnd } from "@/shared/lib";

type FinancialSummaryWidgetProps = {
  totalAssets: number;
  totalLiabilities: number;
  portfolioDetailTotal: number;
  assetConfigurationTotal: number;
  loading?: boolean;
};

export function FinancialSummaryWidget({
  totalAssets,
  totalLiabilities,
  portfolioDetailTotal,
  assetConfigurationTotal,
  loading = false,
}: FinancialSummaryWidgetProps) {
  return (
    <Card variant="hero" className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[var(--surface-hero-muted)]">
          Financial summary
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <Row
          label="Asset configuration"
          value={formatVnd(assetConfigurationTotal)}
          loading={loading}
        />
        <Row
          label="Portfolio detail"
          value={formatVnd(portfolioDetailTotal)}
          loading={loading}
        />
        <div className="my-1 h-px bg-[var(--surface-hero-muted)]/25" />
        <Row label="Total assets" value={formatVnd(totalAssets)} emphasized loading={loading} />
        <Row
          label="Liabilities"
          value={`−${formatVnd(totalLiabilities)}`}
          destructive
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  emphasized,
  destructive,
  loading,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  destructive?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 leading-5">
      <span
        className={
          emphasized
            ? "font-medium text-[var(--surface-hero-fg)]"
            : "text-[var(--surface-hero-muted)]"
        }
      >
        {label}
      </span>
      <span
        className={[
          "font-data-tabular tabular-nums shrink-0",
          emphasized ? "font-semibold text-[var(--surface-hero-fg)]" : "font-medium",
          destructive ? "text-white/90" : "text-[var(--surface-hero-fg)]",
        ].join(" ")}
      >
        {loading ? <Skeleton className="h-4 w-24 inline-block align-middle" /> : value}
      </span>
    </div>
  );
}
