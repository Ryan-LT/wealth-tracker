"use client";

import { MaterialIcon } from "@/shared/ui";

type CashFlowFiltersProps = {
  date: string;
  onDateChange: (next: string) => void;
  category: string;
  onCategoryChange: (next: string) => void;
  categories: string[];
};

export function CashFlowFilters({
  date,
  onDateChange,
  category,
  onCategoryChange,
  categories,
}: CashFlowFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative">
        <MaterialIcon
          name="calendar_month"
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="pl-9 pr-3 py-2 border border-outline-variant rounded bg-surface-container-lowest focus:border-secondary focus:ring-1 focus:ring-secondary font-label-sm text-label-sm text-primary h-10"
        />
      </div>
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-3 py-2 border border-outline-variant rounded bg-surface-container-lowest focus:border-secondary focus:ring-1 focus:ring-secondary font-label-sm text-label-sm text-primary h-10 appearance-none pr-8"
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
