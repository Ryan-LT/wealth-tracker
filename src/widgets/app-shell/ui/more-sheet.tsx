"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";

import { cn } from "@/shared/lib/cn";
import { isNavActive, NAV, QUICK_ADD } from "@/shared/config";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/kit/sheet";

import { isPlainClick } from "../model/navigation";
import { useShell } from "../model/shell-context";

const PAGES = NAV.filter((i) => !i.mobileTab);

type MoreSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activePath: string;
  navigate: (href: string) => void;
};

/** Mobile "More": the pages that don't fit in the dock, plus quick-add and search. */
export function MoreSheet({ open, onOpenChange, activePath, navigate }: MoreSheetProps) {
  const { setCommandOpen } = useShell();

  const go = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    onOpenChange(false);
    navigate(href);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[85dvh] gap-0 overflow-y-auto rounded-t-2xl pb-[calc(env(safe-area-inset-bottom)+1rem)] ease-out data-[state=closed]:duration-200 data-[state=open]:duration-300 md:hidden"
      >
        <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-border" />
        <SheetHeader className="pb-3">
          <SheetTitle>More</SheetTitle>
          <SheetDescription>Every other page, plus shortcuts.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-5 px-4">
          <ul className="grid grid-cols-2 gap-2">
            {PAGES.map((item) => {
              const active = isNavActive(activePath, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={(e) => go(e, item.href)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-full items-start gap-3 rounded-xl border bg-card p-3 transition-[background-color,transform] active:scale-[0.98]",
                      active ? "border-primary/40 bg-primary-soft" : "hover:bg-accent",
                    )}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-soft-foreground">
                      <item.icon className="size-4.5" aria-hidden />
                    </span>
                    <span className="grid min-w-0 gap-0.5">
                      <span className="text-sm leading-tight font-medium">{item.label}</span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">{item.description}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <section aria-labelledby="more-quick-add">
            <h3 id="more-quick-add" className="mb-2 text-xs font-medium text-muted-foreground">
              Quick add
            </h3>
            <ul className="grid grid-cols-5 gap-2">
              {QUICK_ADD.map((action) => (
                <li key={action.href}>
                  <Link
                    href={action.href}
                    onClick={(e) => go(e, action.href)}
                    aria-label={action.label}
                    className="flex flex-col items-center gap-1.5 rounded-xl border bg-card px-1 py-2.5 text-xs font-medium transition-[background-color,transform] hover:bg-accent active:scale-95"
                  >
                    <action.icon className="size-5 text-primary" aria-hidden />
                    {action.short}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              setCommandOpen(true);
            }}
            className="flex h-11 items-center gap-2 rounded-xl border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            <Search className="size-4" aria-hidden />
            Search pages and records…
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
