import type { Metadata } from "next";
import { Suspense } from "react";

import { IncomePage } from "@/views/income";

export const metadata: Metadata = { title: "Income & spending" };

export default function Page() {
  return (
    <Suspense>
      <IncomePage />
    </Suspense>
  );
}
