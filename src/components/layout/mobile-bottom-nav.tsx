"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useOptimistic } from "react";

import { cn } from "@/lib/utils";
import { NAV } from "@/shared/config";

function isActive(activeHref: string, href: string) {
  if (href === "/") return activeHref === "/";
  return activeHref === href || activeHref.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [optimisticActive, setOptimisticActive] = useOptimistic(pathname);

  const handleNavigate = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    if (href === pathname) return;
    startTransition(() => {
      setOptimisticActive(href);
      router.push(href);
    });
  };

  return (
    <div
      className={cn(
        "md:hidden",
        "pointer-events-none fixed inset-x-0 z-40 flex justify-center",
        "bottom-[max(0.75rem,env(safe-area-inset-bottom))]",
        "px-4",
      )}
    >
      <nav
        aria-label="Primary"
        className={cn(
          "pointer-events-auto",
          "flex items-center gap-1",
          "rounded-full border border-border/60",
          "bg-sidebar/95 supports-backdrop-filter:bg-sidebar/75 backdrop-blur-xs",
          "shadow-[0_8px_24px_-4px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)]",
          "px-1.5 py-1.5",
        )}
      >
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(optimisticActive, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => handleNavigate(event, item.href)}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "relative inline-flex items-center justify-center",
                "size-11 shrink-0 rounded-full",
                "transition-[background-color,color,transform,box-shadow] duration-200",
                "active:scale-[0.92]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/40 ring-4 ring-sidebar-primary/15"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-5" />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
