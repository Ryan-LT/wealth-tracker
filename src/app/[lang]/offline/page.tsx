import { CloudOff } from "lucide-react";
import Link from "next/link";

import { messagesFor } from "@/shared/i18n/active";
import { isLocale } from "@/shared/i18n/locale";
import { Button } from "@/shared/ui/kit/button";
import { Logo } from "@/shared/ui/logo";

export const dynamic = "force-static";

export default async function OfflinePage({ params }: PageProps<"/[lang]/offline">) {
  const { lang } = await params;
  const t = messagesFor(isLocale(lang) ? lang : "en").auth.offline;
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <Logo size={44} decorative />
        <div className="flex items-center gap-2 text-muted-foreground">
          <CloudOff className="size-4" aria-hidden />
          <h1 className="text-lg font-semibold text-foreground">{t.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{t.body}</p>
        <Button asChild variant="outline">
          <Link href="/">{t.openDashboard}</Link>
        </Button>
      </div>
    </main>
  );
}
