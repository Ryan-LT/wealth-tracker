"use client";

import { useEffect, useState } from "react";

import { Button, Card, MaterialIcon, MoneyInput } from "@/shared/ui";

type NetIncomeInputCardProps = {
  initialValue: number;
  onUpdate: (next: number) => void;
};

export function NetIncomeInputCard({ initialValue, onUpdate }: NetIncomeInputCardProps) {
  const [amount, setAmount] = useState(initialValue);

  useEffect(() => {
    setAmount(initialValue);
  }, [initialValue]);

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
        <MoneyInput
          value={amount}
          onChange={setAmount}
          decimals={2}
          variant="standard"
          size="medium"
          placeholder="0.00"
          sx={{
            "& input": {
              fontSize: "1.25rem",
              lineHeight: "1.75rem",
              fontWeight: 600,
              textAlign: "right",
              color: "var(--color-primary)",
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "var(--color-outline-variant)",
              borderBottomWidth: 2,
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: "var(--color-secondary)",
            },
          }}
        />
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 h-12"
          onClick={() => onUpdate(amount)}
        >
          Update
        </Button>
      </div>
    </Card>
  );
}
