import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

/** Standard page body: centered, max width, consistent gutters and vertical rhythm. */
export function PageContainer({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div id="main-content" className={cn("mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-5 md:px-6 md:py-6", className)}>
      {children}
    </div>
  );
}
