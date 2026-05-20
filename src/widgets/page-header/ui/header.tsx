"use client";

import * as React from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/shared/lib";

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
};

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        "z-50 h-16",
        fixed && [
          "sticky top-0 w-[inherit]",
          "bg-background/80 supports-backdrop-filter:bg-background/70 backdrop-blur-md",
          "border-b border-border/60 shadow-sm",
        ],
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
  );
}
