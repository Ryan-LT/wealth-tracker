import type { Metadata } from "next";
import { Suspense } from "react";

import { LoansPage } from "@/views/loans";

export const metadata: Metadata = { title: "Personal loans" };

export default function Page() {
  return (
    <Suspense>
      <LoansPage />
    </Suspense>
  );
}
