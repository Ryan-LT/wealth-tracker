import type { IncomeSource } from "@/shared/storage";
import { Card, MaterialIcon } from "@/shared/ui";

import { IncomeSourceRow } from "./IncomeSourceRow";

type IncomeSourcesPanelProps = {
  title: string;
  sources: IncomeSource[];
  onAdd?: () => void;
};

export function IncomeSourcesPanel({ title, sources, onAdd }: IncomeSourcesPanelProps) {
  return (
    <Card className="lg:col-span-6 p-6">
      <div className="flex justify-between items-center border-b border-outline-variant pb-stack-sm mb-stack-md">
        <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
          {title}
        </h3>
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Add ${title}`}
          className="text-secondary hover:text-on-secondary-container transition-colors"
        >
          <MaterialIcon name="add" size={18} />
        </button>
      </div>
      <ul className="space-y-4">
        {sources.map((s) => (
          <IncomeSourceRow key={s.id} source={s} />
        ))}
      </ul>
    </Card>
  );
}
