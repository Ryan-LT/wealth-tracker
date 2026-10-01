"use client";

import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/shared/ui/kit/sidebar";

import { ShellProvider } from "../model/shell-context";
import { AppSidebar } from "./app-sidebar";
import { CommandMenu } from "./command-menu";
import { HydrationGate } from "./hydration-gate";
import { MobileTabBar } from "./mobile-tab-bar";
import { TopBar } from "./top-bar";

type AppShellProps = {
  defaultSidebarOpen: boolean;
  userName: string;
  authEnabled: boolean;
  children: ReactNode;
};

export function AppShell({ defaultSidebarOpen, userName, authEnabled, children }: AppShellProps) {
  return (
    <ShellProvider userName={userName} authEnabled={authEnabled}>
      <HydrationGate>
        <SidebarProvider defaultOpen={defaultSidebarOpen}>
          <a
            href="#main-content"
            className="fixed top-2 left-2 z-[60] -translate-y-16 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:translate-y-0"
          >
            Skip to content
          </a>
          <AppSidebar />
          <SidebarInset className="min-w-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 md:peer-data-[variant=inset]:border">
            <TopBar />
            <main className="min-w-0 flex-1">{children}</main>
          </SidebarInset>
          <MobileTabBar />
          <CommandMenu />
        </SidebarProvider>
      </HydrationGate>
    </ShellProvider>
  );
}
