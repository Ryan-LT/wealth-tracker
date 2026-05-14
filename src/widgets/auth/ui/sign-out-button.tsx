"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/shared/ui";

type SignOutButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "outline-secondary";
  className?: string;
  label?: string;
};

export function SignOutButton({
  variant = "secondary",
  className,
  label = "Sign out",
}: SignOutButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onSignOut = useCallback(async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }, [router]);

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={busy}
      onClick={() => void onSignOut()}
    >
      {busy ? "Signing out…" : label}
    </Button>
  );
}
