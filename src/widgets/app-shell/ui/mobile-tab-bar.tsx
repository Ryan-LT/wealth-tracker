"use client";

import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/shared/lib/cn";
import { isNavActive, NAV } from "@/shared/config";

import { useOptimisticNavigation } from "../model/navigation";
import { MoreSheet } from "./more-sheet";

const TABS = NAV.filter((i) => i.mobileTab);
const SLOTS = TABS.length + 1; // + More

/**
 * Floating bottom dock below `md`. The highlight slides to the tapped tab
 * immediately, before the page has rendered; "More" opens a sheet with the
 * remaining pages and quick-add actions.
 */
export function MobileTabBar() {
  const { activePath, onLinkClick, navigate } = useOptimisticNavigation();
  const [moreOpen, setMoreOpen] = useState(false);
  const tabIndex = TABS.findIndex((t) => isNavActive(activePath, t.href));
  const activeIndex = moreOpen || tabIndex === -1 ? TABS.length : tabIndex;

  return (
    <>
      <nav
        aria-label="Primary"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden"
      >
        <ul
          className="pointer-events-auto relative mx-auto grid h-16 max-w-md rounded-2xl border border-border/80 bg-card/80 p-1 shadow-lg shadow-black/5 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70 dark:shadow-black/40"
          style={{ gridTemplateColumns: `repeat(${SLOTS}, minmax(0, 1fr))` }}
        >
          <span
            aria-hidden
            className="absolute inset-y-1 left-1 rounded-xl bg-primary-soft transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
            style={{ width: `calc((100% - 0.5rem) / ${SLOTS})`, transform: `translateX(${activeIndex * 100}%)` }}
          />
          {TABS.map((item, i) => (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                onClick={(e) => onLinkClick(e, item.href)}
                aria-current={i === tabIndex && !moreOpen ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium transition-[color,transform] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
                  i === activeIndex ? "text-primary-soft-foreground" : "text-muted-foreground",
                )}
              >
                <item.icon
                  aria-hidden
                  className={cn(
                    "size-5 transition-transform duration-300 motion-reduce:transition-none",
                    i === activeIndex && "-translate-y-px scale-110 fill-primary/15",
                  )}
                />
                <span className="leading-none">{item.short}</span>
              </Link>
            </li>
          ))}
          <li className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
              className={cn(
                "flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium transition-[color,transform] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
                activeIndex === TABS.length ? "text-primary-soft-foreground" : "text-muted-foreground",
              )}
            >
              <Ellipsis
                aria-hidden
                className={cn(
                  "size-5 transition-transform duration-300 motion-reduce:transition-none",
                  activeIndex === TABS.length && "-translate-y-px scale-110 fill-primary/15",
                )}
              />
              <span className="leading-none">More</span>
            </button>
          </li>
        </ul>
      </nav>
      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} activePath={activePath} navigate={navigate} />
    </>
  );
}
