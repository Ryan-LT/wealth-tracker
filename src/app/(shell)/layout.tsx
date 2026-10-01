import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { isAuthEnvConfigured } from "@/shared/api/auth-session";
import { AppShell } from "@/widgets/app-shell";

export default async function ShellLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const defaultSidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const userName = process.env.AUTH_USERNAME?.trim() || "Owner";

  return (
    <AppShell defaultSidebarOpen={defaultSidebarOpen} userName={userName} authEnabled={isAuthEnvConfigured()}>
      {children}
    </AppShell>
  );
}
