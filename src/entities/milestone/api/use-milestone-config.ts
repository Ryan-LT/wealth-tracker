"use client";

import { useCallback, useEffect, useState } from "react";

import type { MilestoneConfigResponse } from "@/entities/milestone/model";
import { onAppForeground } from "@/shared/lib/app-foreground";

/** Loads `/api/finance/milestone-35-config` and refreshes it when the app returns to the foreground. */
export function useMilestone35Config(): {
  config: MilestoneConfigResponse | null;
  error: string | null;
  reload: () => void;
} {
  const [config, setConfig] = useState<MilestoneConfigResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/finance/milestone-35-config", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as MilestoneConfigResponse;
        if (!cancelled) {
          setConfig(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load milestone settings");
      }
    };
    void load();
    const off = onAppForeground(() => void load());
    return () => {
      cancelled = true;
      off();
    };
  }, [nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { config, error, reload };
}
