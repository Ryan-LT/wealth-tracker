import Link from "next/link";

import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <div className="max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">You&apos;re offline</h1>
        <p className="text-sm text-muted-foreground">
          This page hasn&apos;t been saved for offline use yet. Try a route
          you&apos;ve already opened, or check your connection.
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <Button asChild variant="outline">
            <Link href="/">Open dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
