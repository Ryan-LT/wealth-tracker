"use client";

import { useId, useState } from "react";

import { Card, MaterialIcon } from "@/shared/ui";

type NetIncomeInputCardProps = {
  initialValue: number;
  onUpdate: (next: number) => void;
};

export function NetIncomeInputCard({ initialValue, onUpdate }: NetIncomeInputCardProps) {
  const [value, setValue] = useState(
    initialValue.toLocaleString("en-US", { minimumFractionDigits: 2 }),
  );
  const id = useId();

  function handleSubmit() {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) onUpdate(parsed);
  }

  return (
    <Card className="lg:col-span-8 p-6 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">
            Real Month Net Income
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Available liquidity for deployment.
          </p>
        </div>
        <MaterialIcon
          name="account_balance_wallet"
          className="text-secondary bg-secondary-container/20 p-2 rounded-lg"
        />
      </div>

      <div className="flex items-end gap-4 mt-8">
        <div className="flex-1 relative">
          <label htmlFor={id} className="sr-only">
            Net income amount
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="font-headline-lg text-headline-lg text-primary">₫</span>
          </div>
          <input
            id={id}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            className="block w-full pl-8 pr-4 py-2 border-0 border-b-2 border-outline-variant bg-transparent focus:ring-0 focus:border-secondary font-headline-lg text-headline-lg text-primary text-right outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="h-12 px-6 bg-surface border border-outline-variant text-primary font-label-sm text-label-sm rounded hover:bg-surface-container-low transition-colors uppercase"
        >
          Update
        </button>
      </div>
    </Card>
  );
}
