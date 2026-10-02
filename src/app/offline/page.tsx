import { CloudOff } from "lucide-react";
import Link from "next/link";

import { Button } from "@/shared/ui/kit/button";
import { Logo } from "@/shared/ui/logo";

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <Logo size={44} decorative />
        <div className="flex items-center gap-2 text-muted-foreground">
          <CloudOff className="size-4" aria-hidden />
          <h1 className="text-lg font-semibold text-foreground">You&apos;re offline</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          This page hasn&apos;t been saved for offline use yet. Pages you&apos;ve opened before still work — your data is
          kept on this device and syncs when you reconnect.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Open dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
