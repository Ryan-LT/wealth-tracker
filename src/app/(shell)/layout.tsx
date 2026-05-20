import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { HydrationGate } from "@/components/layout/hydration-gate";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LayoutProvider } from "@/context/layout-provider";
import { cn } from "@/lib/utils";

export default async function ShellLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <LayoutProvider>
      <HydrationGate>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset
            className={cn(
              "@container/content",
              "has-data-[layout=fixed]:h-svh",
              "peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]",
              "pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0",
            )}
          >
            {children}
          </SidebarInset>
          <MobileBottomNav />
        </SidebarProvider>
      </HydrationGate>
    </LayoutProvider>
  );
}
