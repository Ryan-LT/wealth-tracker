import type { Metadata } from "next";
import { Suspense } from "react";

import { messagesFor } from "@/shared/i18n/active";
import { isLocale } from "@/shared/i18n/locale";
import { DebtsPage } from "@/views/debts";

export async function generateMetadata({ params }: PageProps<"/[lang]/debts">): Promise<Metadata> {
  const { lang } = await params;
  const t = messagesFor(isLocale(lang) ? lang : "en");
  return { title: t.nav.items.debts.label };
}

export default function Page() {
  return (
    <Suspense>
      <DebtsPage />
    </Suspense>
  );
}
