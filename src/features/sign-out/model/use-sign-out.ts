"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { flushTablesNow } from "@/shared/storage/store";

/** Flush pending edits, end the session and go to the login page. */
export function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = useCallback(async () => {
    setPending(true);
    try {
      await flushTablesNow().catch(() => undefined);
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }, [router]);

  return { signOut, pending };
}
