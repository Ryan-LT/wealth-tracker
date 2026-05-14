import * as React from "react";

import { cn } from "@/lib/utils";

type MainProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
};

export function Main({ fixed, className, children, ...props }: MainProps) {
  return (
    <main
      data-layout={fixed ? "fixed" : "auto"}
      className={cn(
        "@container/main peer-[.header-fixed]/header:mt-16",
        "flex-1 px-4 py-6",
        fixed && "flex flex-col overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}
