"use client";

import * as React from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/shared/lib";

import { useFixedHeaderInset } from "./use-fixed-header-inset";

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
};

/**
 * Page header. When `fixed`, stays pinned while scrolling and tracks the
 * main column offset as the sidebar expands or collapses.
 */
export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const inset = useFixedHeaderInset();

  const inner = (
    <div className="relative flex h-full items-center gap-3 p-4 sm:gap-4">
      <SidebarTrigger variant="outline" className="hidden md:inline-flex" />
      <Separator orientation="vertical" className="hidden h-6 md:block" />
      {children}
    </div>
  );

  if (!fixed) {
    return (
      <header className={cn("z-50 h-16", className)} {...props}>
        {inner}
      </header>
    );
  }

  return (
    <>
      <div
        aria-hidden
        className="shrink-0"
        style={{ height: "calc(3.5rem + var(--offline-banner-h, 0px))" }}
      />
      <header
        style={{ left: inset.left, right: inset.right }}
        className={cn(
          "fixed z-40 h-14 top-(--offline-banner-h,0px)",
          "transition-[left,right] duration-200 ease-linear",
          "bg-background/80 supports-backdrop-filter:bg-background/70 backdrop-blur-md",
          "border-b border-border/60",
          className,
        )}
        {...props}
      >
        {inner}
      </header>
    </>
  );
}
