"use client";

import { Check, MoreVertical, Pencil, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib";
import { formatVnd } from "@/shared/lib";
import type { PersonalLoan } from "@/entities/personal-loan";

export function LoanCardSkeleton() {
  return (
    <Card>
      <div className="flex items-start gap-3 p-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2 leading-tight">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <p className="mt-0.5 leading-4">
            <Skeleton className="h-3 w-24 inline-block align-middle" />
          </p>
        </div>
        <div className="size-7 shrink-0" />
      </div>
    </Card>
  );
}

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
    <Card
      variant="quiet"
      className={cn("transition-colors", settled && "opacity-60")}
    >
      <div className="flex items-start gap-3 p-4 md:p-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="truncate text-sm font-medium leading-tight">{loan.person || "—"}</h4>
            <span
              className={cn(
                "shrink-0 text-sm font-semibold font-data-tabular tabular-nums",
                settled
                  ? "text-muted-foreground line-through"
                  : isLent
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive",
              )}
            >
              {formatVnd(loan.amount)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatLoanDate(loan.date)}
            {loan.note ? <span className="ml-2">· {loan.note}</span> : null}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 shrink-0">
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
    </Card>
  );
}
