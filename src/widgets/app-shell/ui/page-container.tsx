import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type PageContainerProps = {
  className?: string;
  /** Placeholder layout while a page loads: no skip-link target, marked busy. */
  skeleton?: boolean;
  children: ReactNode;
};

/** Standard page body: centered, max width, consistent gutters and vertical rhythm. */
export function PageContainer({ className, skeleton, children }: PageContainerProps) {
  return (
    <div
      id={skeleton ? undefined : "main-content"}
      aria-busy={skeleton || undefined}
      className={cn("mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-5 md:px-6 md:py-6", className)}
    >
      {children}
    </div>
  );
}
