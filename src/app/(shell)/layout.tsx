import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/shared/lib";
import { AppSidebar, LayoutProvider } from "@/widgets/app-sidebar";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";
import { HydrationGate } from "@/widgets/page-shell";

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
              "pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-0",
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
