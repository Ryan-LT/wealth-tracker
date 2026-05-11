import type { ReactNode } from "react";

import { BottomNav } from "@/widgets/bottom-nav";
import { Sidebar } from "@/widgets/sidebar";

type AppShellProps = {
  children: ReactNode;
};

/**
 * Application chrome that wraps every route: fixed desktop sidebar on the left,
 * fixed bottom-nav on mobile, and a content slot pushed past the sidebar.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-col mt-10 bg-background md:ml-sidebar-width">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
