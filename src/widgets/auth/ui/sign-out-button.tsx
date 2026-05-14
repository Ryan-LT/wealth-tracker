"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive" | "link";
  className?: string;
  label?: string;
  showIcon?: boolean;
};

export function SignOutButton({
  variant = "outline",
  className,
  label = "Sign out",
  showIcon = true,
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
      className={cn(className)}
      disabled={busy}
      onClick={() => void onSignOut()}
    >
      {showIcon && <LogOut className="size-4" />}
      {busy ? "Signing out…" : label}
    </Button>
  );
}
