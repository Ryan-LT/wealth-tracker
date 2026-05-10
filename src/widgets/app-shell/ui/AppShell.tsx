import type { ReactNode } from "react";

import { BottomNav } from "@/widgets/bottom-nav";
import { Sidebar } from "@/widgets/sidebar";

type AppShellProps = {
  children: ReactNode;
};

/**
 * Application chrome that wraps every route: fixed desktop sidebar on the left,
 * fixed bottom-nav on mobile, and a content slot pushed past the sidebar.
 *
 * Each view renders its own <TopAppBar> inside the slot — page-specific headers
 * (search field, page title, metric badge) make a single shared topbar
 * untenable while keeping the design pixel-faithful.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <Sidebar />
      <div className="flex min-h-screen min-w-0 max-w-full flex-1 flex-col md:ml-sidebar-width w-full">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
