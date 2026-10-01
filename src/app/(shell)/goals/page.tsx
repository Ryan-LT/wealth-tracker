import type { Metadata } from "next";

import { GoalsPage } from "@/views/goals";

export const metadata: Metadata = { title: "Goals" };

export default function Page() {
  return <GoalsPage />;
}
