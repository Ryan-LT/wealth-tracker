import type { Metadata } from "next";
import { Suspense } from "react";

import { DebtsPage } from "@/views/debts";

export const metadata: Metadata = { title: "Debts" };

export default function Page() {
  return (
    <Suspense>
      <DebtsPage />
    </Suspense>
  );
}
