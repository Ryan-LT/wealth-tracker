"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { useSessionUser } from "@/shared/lib/session-user";

type ShellContextValue = {
  userName: string;
  authEnabled: boolean;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({
  authEnabled,
  children,
}: {
  authEnabled: boolean;
  children: ReactNode;
}) {
  // The shell is prerendered, so the account name comes from the readable session cookie.
  const user = useSessionUser();
  const userName = user?.name || (authEnabled ? "" : "Owner");
  const [commandOpen, setCommandOpen] = useState(false);
  const value = useMemo(
    () => ({ userName, authEnabled, commandOpen, setCommandOpen }),
    [userName, authEnabled, commandOpen],
  );
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <ShellProvider>");
  return ctx;
}
