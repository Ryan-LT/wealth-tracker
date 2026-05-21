"use client";

import * as React from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/shared/lib";

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
};

/**
 * Page header. When `fixed`, pins to the viewport top (using `position: fixed`)
 * and reserves space via a sibling spacer so content does not jump.
 * On desktop the header is offset by the sidebar width.
 */
export function Header({ className, fixed, children, ...props }: HeaderProps) {
  if (!fixed) {
    return (
      <header className={cn("z-50 h-16", className)} {...props}>
        <div className="relative flex h-full items-center gap-3 p-4 sm:gap-4">
          <SidebarTrigger variant="outline" className="hidden md:inline-flex" />
          <Separator orientation="vertical" className="hidden h-6 md:block" />
          {children}
        </div>
      </header>
    );
  }

  return (
    <>
      <div aria-hidden className="h-14 shrink-0" />
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-40 h-14",
          "md:left-(--sidebar-width)",
          "bg-background/80 supports-backdrop-filter:bg-background/70 backdrop-blur-md",
          "border-b border-border/60",
          className,
        )}
        {...props}
      >
        <div className="relative flex h-full items-center gap-3 p-4 sm:gap-4">
          <SidebarTrigger variant="outline" className="hidden md:inline-flex" />
          <Separator orientation="vertical" className="hidden h-6 md:block" />
          {children}
        </div>
      </header>
    </>
  );
}
