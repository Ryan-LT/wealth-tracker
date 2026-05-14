"use client";

import { Check, MoreVertical, Pencil, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatVnd } from "@/shared/lib";
import type { PersonalLoan } from "@/shared/storage";

type LoanCardProps = {
  loan: PersonalLoan;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSettled: () => void;
};

function formatLoanDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function LoanCard({ loan, onEdit, onDelete, onToggleSettled }: LoanCardProps) {
  const isLent = loan.direction === "lent_out";
  const settled = loan.status === "settled";

  return (
    <Card className={cn("transition-colors", settled && "opacity-60")}>
      <CardContent className="p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-base font-medium leading-tight">{loan.person || "—"}</h4>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {formatLoanDate(loan.date)}
            </p>
          </div>
          <div className="shrink-0 text-end">
            <p
              className={cn(
                "text-lg font-semibold font-data-tabular tabular-nums",
                settled
                  ? "text-muted-foreground line-through"
                  : isLent
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive",
              )}
            >
              {formatVnd(loan.amount)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {settled ? "Settled" : isLent ? "Owed to you" : "You owe"}
            </p>
          </div>
        </div>

        {loan.note ? (
          <p className="mb-2 whitespace-pre-line text-sm text-muted-foreground">{loan.note}</p>
        ) : null}

        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreVertical className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onToggleSettled}>
                {settled ? (
                  <>
                    <RotateCcw className="mr-2 size-4" /> Reopen
                  </>
                ) : (
                  <>
                    <Check className="mr-2 size-4" /> Mark settled
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 size-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
