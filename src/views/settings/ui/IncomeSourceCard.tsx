"use client";

import { formatThousands } from "@/shared/lib";
import type { IncomeSource } from "@/shared/storage";
import { Badge, MaterialIcon } from "@/shared/ui";

type IncomeSourceCardProps = {
  source: IncomeSource;
  onEdit: () => void;
  onDelete: () => void;
};

export function IncomeSourceCard({ source, onEdit, onDelete }: IncomeSourceCardProps) {
  return (
    <div className="border border-outline-variant rounded-lg p-stack-md bg-surface-bright">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-body-md text-body-md font-semibold text-primary">
            {source.name}
          </h3>
          {source.details ? (
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              {source.details}
            </p>
          ) : null}
          {source.paymentEntity ? (
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {source.paymentEntity}
            </p>
          ) : null}
          {source.paymentDay ? (
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
              Payment Date: {ordinal(source.paymentDay)}
            </p>
          ) : null}
        </div>
        <Badge tone={source.kind === "active" ? "active" : "passive"}>
          {source.kind === "active" ? "Active" : "Passive"}
        </Badge>
      </div>
      <div className="flex justify-between items-end">
        <div className="font-data-tabular text-data-tabular text-primary text-lg">
          {formatThousands(source.monthly)} ₫{" "}
          <span className="text-sm text-on-surface-variant font-body-md">/mo</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Edit ${source.name}`}
            onClick={onEdit}
            className="text-on-surface-variant hover:text-secondary transition-colors"
          >
            <MaterialIcon name="edit" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${source.name}`}
            onClick={onDelete}
            className="text-on-surface-variant hover:text-error transition-colors"
          >
            <MaterialIcon name="delete" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}
