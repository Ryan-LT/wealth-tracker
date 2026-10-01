import type { Metadata } from "next";

import { LoansPage } from "@/views/loans";

export const metadata: Metadata = { title: "Personal loans" };

export default function Page() {
  return <LoansPage />;
}
