import * as React from "react";

import { cn } from "@/shared/lib";

type MainProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
};

export function Main({ fixed, className, children, ...props }: MainProps) {
  return (
    <main
      data-layout={fixed ? "fixed" : "auto"}
      className={cn(
        "@container/main",
        "flex-1 p-5 md:p-6",
        fixed && "flex flex-col overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}
