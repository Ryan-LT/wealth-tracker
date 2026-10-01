"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent } from "react";

/**
 * Opens a page's "create" dialog when the URL has `?new=1` (used by the command
 * palette's quick actions), then removes the param so a refresh doesn't reopen it.
 * Pages using this must render inside a `<Suspense>` boundary.
 */
export function useCreateParam(openCreate: () => void) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const onNew = useEffectEvent(openCreate);

  const wantsNew = params.get("new") === "1";
  useEffect(() => {
    if (!wantsNew) return;
    onNew();
    router.replace(pathname, { scroll: false });
  }, [wantsNew, pathname, router]);
}
