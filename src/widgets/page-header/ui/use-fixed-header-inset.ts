"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { useLayout } from "@/widgets/app-sidebar/lib/layout-provider";

/** Match `src/components/ui/sidebar.tsx` desktop widths. */
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3rem";
/** Tailwind `spacing(4)` used by inset/floating icon collapse gap. */
const SIDEBAR_ICON_GAP_EXTRA = "1rem";
const INSET_MARGIN = "0.5rem";

/**
 * Viewport inset for a fixed page header so it aligns with SidebarInset
 * when the sidebar is expanded, collapsed to icons, or off-canvas.
 */
export function useFixedHeaderInset(): { left: string; right: string } {
  const { state, isMobile } = useSidebar();
  const { collapsible, variant } = useLayout();

  if (isMobile) {
    return { left: "0px", right: "0px" };
  }

  const collapsed = state === "collapsed";
  const isInset = variant === "inset" || variant === "floating";

  let left: string;

  if (collapsible === "offcanvas" && collapsed) {
    left = "0px";
  } else if (!collapsed) {
    left = SIDEBAR_WIDTH;
  } else if (collapsible === "icon") {
    left = isInset
      ? `calc(${SIDEBAR_WIDTH_ICON} + ${SIDEBAR_ICON_GAP_EXTRA})`
      : SIDEBAR_WIDTH_ICON;
  } else {
    left = SIDEBAR_WIDTH;
  }

  if (isInset && collapsed && collapsible !== "offcanvas") {
    left = `calc(${left} + ${INSET_MARGIN})`;
  }

  const right = isInset ? INSET_MARGIN : "0px";

  return { left, right };
}
