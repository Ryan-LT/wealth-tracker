"use client";

import { Search, X } from "lucide-react";
import type { ReactNode } from "react";

import { useI18n } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { Input } from "@/shared/ui/kit/input";

type DataTableToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  /** Filters / view options to the right of the search box. */
  children?: ReactNode;
  className?: string;
};

export function DataTableToolbar({ search, onSearchChange, placeholder: placeholderProp, children, className }: DataTableToolbarProps) {
  const { t } = useI18n();
  const placeholder = placeholderProp ?? t.shell.ui.searchPlaceholder;
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center", className)}>
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pr-8 pl-8"
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label={t.shell.ui.clearSearch}
            className="absolute top-1/2 right-1.5 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{children}</div> : null}
    </div>
  );
}

/** Case-insensitive "every word appears" match. */
export function matchesSearch(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const h = haystack.toLowerCase();
  return q.split(/\s+/).every((word) => h.includes(word));
}
