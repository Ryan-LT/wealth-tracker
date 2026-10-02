import type { ReactNode } from "react";

import { OfflineShellWarmup } from "@/app/_providers/sw-register";
import { isAuthEnvConfigured } from "@/shared/api/auth-session";
import { AppShell } from "@/widgets/app-shell";

/**
 * Deliberately static (no cookies or headers here): pages hold no server data,
 * so every route is prerendered and fully prefetched, and switching pages is
 * instant. Access is still enforced per request by `src/proxy.ts`.
 */
export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell authEnabled={isAuthEnvConfigured()}>
      <OfflineShellWarmup />
      {children}
    </AppShell>
  );
}
