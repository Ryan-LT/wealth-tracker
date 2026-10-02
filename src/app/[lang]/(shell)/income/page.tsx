import type { Metadata } from "next";
import { Suspense } from "react";

import { messagesFor } from "@/shared/i18n/active";
import { isLocale } from "@/shared/i18n/locale";
import { IncomePage } from "@/views/income";

export async function generateMetadata({ params }: PageProps<"/[lang]/income">): Promise<Metadata> {
  const { lang } = await params;
  const t = messagesFor(isLocale(lang) ? lang : "en");
  return { title: t.nav.items.income.label };
}

export default function Page() {
  return (
    <Suspense>
      <IncomePage />
    </Suspense>
  );
}
