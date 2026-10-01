import type { ReactNode } from "react";

/**
 * @deprecated The app shell's top bar replaced per-page headers. Kept as a no-op
 * so not-yet-migrated pages compile; removed once every page uses PageHeader.
 */
export function Header(_props: { fixed?: boolean; children?: ReactNode }) {
  return null;
}
