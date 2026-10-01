import type { Metadata } from "next";

import { SettingsPage } from "@/views/records-legacy";

export const metadata: Metadata = { title: "Assets" };

export default function Page() {
  return <SettingsPage />;
}
