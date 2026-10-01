"use client";

import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { Fragment } from "react";

import { Button } from "@/shared/ui/kit/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/kit/dropdown-menu";

export type RowAction =
  | {
      label: string;
      icon?: LucideIcon;
      onSelect: () => void;
      destructive?: boolean;
      disabled?: boolean;
    }
  | "separator";

/** "⋯" menu at the end of a row. */
export function RowActions({ actions, label }: { actions: RowAction[]; label: string }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          className="text-muted-foreground data-[state=open]:bg-accent"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40" onClick={(e) => e.stopPropagation()}>
        {actions.map((a, i) =>
          a === "separator" ? (
            <DropdownMenuSeparator key={`sep-${i}`} />
          ) : (
            <Fragment key={a.label}>
              <DropdownMenuItem
                variant={a.destructive ? "destructive" : "default"}
                disabled={a.disabled}
                onSelect={a.onSelect}
              >
                {a.icon ? <a.icon /> : null}
                {a.label}
              </DropdownMenuItem>
            </Fragment>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
