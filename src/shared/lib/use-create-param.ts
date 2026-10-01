"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent } from "react";

/**
 * URL-driven dialogs used by the command palette:
 * `?new=1` opens the page's create dialog, `?edit=<id>` opens a record's edit
 * dialog. The param is removed afterwards so a refresh doesn't reopen it.
 * Pages using this must render inside a `<Suspense>` boundary.
 */
export function useCreateParam(openCreate: () => void, openEdit?: (id: string) => boolean | void) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const onNew = useEffectEvent(openCreate);
  const onEdit = useEffectEvent((id: string) => openEdit?.(id));

  const wantsNew = params.get("new") === "1";
  const editId = params.get("edit");
  useEffect(() => {
    if (!wantsNew && !editId) return;
    if (wantsNew) onNew();
    else if (editId) onEdit(editId);
    router.replace(pathname, { scroll: false });
  }, [wantsNew, editId, pathname, router]);
}
