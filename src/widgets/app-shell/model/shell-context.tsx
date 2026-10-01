"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ShellContextValue = {
  userName: string;
  authEnabled: boolean;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({
  userName,
  authEnabled,
  children,
}: {
  userName: string;
  authEnabled: boolean;
  children: ReactNode;
}) {
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
