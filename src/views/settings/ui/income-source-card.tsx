"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatThousands } from "@/shared/lib";
import type { IncomeSource } from "@/shared/storage";
import { Badge } from "@/shared/ui";

type IncomeSourceCardProps = {
  source: IncomeSource;
  onEdit: () => void;
  onDelete: () => void;
};

export function IncomeSourceCard({ source, onEdit, onDelete }: IncomeSourceCardProps) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">{source.name}</h3>
            {source.details ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{source.details}</p>
            ) : null}
            {source.paymentEntity ? (
              <p className="text-xs text-muted-foreground">{source.paymentEntity}</p>
            ) : null}
            {source.paymentDay ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Payment Date: {ordinal(source.paymentDay)}
              </p>
            ) : null}
          </div>
          <Badge tone={source.kind === "active" ? "active" : "passive"}>
            {source.kind === "active" ? "Active" : "Passive"}
          </Badge>
        </div>
        <div className="flex items-end justify-between">
          <div className="text-lg font-semibold font-data-tabular tabular-nums">
            {formatThousands(source.monthly)} ₫{" "}
            <span className="text-sm font-normal text-muted-foreground">/mo</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={`Edit ${source.name}`}
              onClick={onEdit}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              aria-label={`Delete ${source.name}`}
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}
