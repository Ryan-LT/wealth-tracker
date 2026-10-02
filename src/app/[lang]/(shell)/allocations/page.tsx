import type { Metadata } from "next";

import { AllocationsPage } from "@/views/allocations";

export const metadata: Metadata = { title: "Liquidity" };

export default function Page() {
  return <AllocationsPage />;
}
