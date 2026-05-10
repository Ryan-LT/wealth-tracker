import type { IncomeSource } from "@/shared/storage";
import { Button, MaterialIcon } from "@/shared/ui";

import { IncomeSourceCard } from "./IncomeSourceCard";

type IncomeSourcesGridProps = {
  sources: IncomeSource[];
  onAdd: () => void;
};

export function IncomeSourcesGrid({ sources, onAdd }: IncomeSourcesGridProps) {
  // Settings page only shows the two "high level" entries — primary salary + rental.
  const featured = sources.filter((s) => s.paymentEntity);

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg">
      <div className="p-stack-md border-b border-outline-variant bg-surface flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-stack-sm">
          <MaterialIcon name="receipt_long" filled className="text-primary" />
          <h2 className="font-headline-md text-headline-md text-primary">Income Sources</h2>
        </div>
        <Button variant="secondary" onClick={onAdd}>
          Add Source
        </Button>
      </div>
      <div className="p-stack-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          {featured.map((source) => (
            <IncomeSourceCard key={source.id} source={source} />
          ))}
        </div>
      </div>
    </section>
  );
}
