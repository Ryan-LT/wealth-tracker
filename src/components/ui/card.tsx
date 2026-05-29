import * as React from "react";

import { cn } from "@/shared/lib";

/** Visual hierarchy for panels. Prefer one hero per viewport; use primary sparingly. */
export type CardVariant =
  | "default"
  | "hero"
  | "primary"
  | "secondary"
  | "outflow"
  | "quiet";

const variantClass: Record<CardVariant, string> = {
  default: "bg-card border-border shadow-sm",
  hero: "card-hero bg-transparent",
  primary: "card-primary bg-transparent shadow-sm",
  secondary:
    "card-secondary shadow-sm [&_[data-slot=card-header]]:pl-7 [&_[data-slot=card-content]]:pl-7 [&_[data-slot=card-footer]]:pl-7",
  outflow:
    "card-outflow shadow-sm [&_[data-slot=card-header]]:pl-7 [&_[data-slot=card-content]]:pl-7 [&_[data-slot=card-footer]]:pl-7",
  quiet: "card-quiet bg-transparent shadow-none",
};

type CardProps = React.ComponentProps<"div"> & {
  variant?: CardVariant;
};

function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(
        "flex flex-col gap-0 rounded-xl border text-card-foreground",
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 pt-4 pb-4",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        "[.border-b]:pb-4",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("lg:p-6 p-3", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 pt-0", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
