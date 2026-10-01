"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { cn } from "@/shared/lib/cn";

type DataTableColumnHeaderProps<T, V> = {
  column: Column<T, V>;
  title: string;
  align?: "left" | "right";
};

/** Click to cycle asc → desc → none. */
export function DataTableColumnHeader<T, V>({ column, title, align = "left" }: DataTableColumnHeaderProps<T, V>) {
  if (!column.getCanSort()) {
    return <span className={cn(align === "right" && "block text-right")}>{title}</span>;
  }
  const sorted = column.getIsSorted();
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "-mx-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none",
        sorted && "text-foreground",
        align === "right" && "float-right flex-row-reverse",
      )}
    >
      {title}
      <Icon className={cn("size-3.5", !sorted && "opacity-50")} aria-hidden />
    </button>
  );
}
