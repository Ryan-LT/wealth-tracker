import * as React from "react";

import { cn } from "@/shared/lib";

/** Visual hierarchy for panels. Prefer one hero per viewport; use primary sparingly. */
export type CardVariant =
  | "default"
  | "hero"
  | "heroBlue"
  | "primary"
  | "secondary"
  | "outflow"
  | "quiet";

const heroText =
  "text-[var(--surface-hero-fg)] [&_[data-slot=card-description]]:text-[var(--surface-hero-muted)] [&_[data-slot=card-title]]:text-[var(--surface-hero-fg)]";

const variantClass: Record<CardVariant, string> = {
  default: "bg-card border-transparent shadow-soft",
  hero: cn("card-hero border-transparent", heroText),
  heroBlue: cn("card-hero-blue border-transparent", heroText),
  primary: "card-primary border-transparent",
  secondary: "card-secondary border-transparent",
  outflow: "card-outflow border-transparent",
  quiet: "card-quiet border-transparent shadow-none",
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
        "flex flex-col gap-0 rounded-2xl border text-card-foreground",
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
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 pt-5 pb-4",
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
      className={cn("text-base leading-tight font-semibold", className)}
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
      className={cn("px-5 pb-5 pt-0 lg:px-6 lg:pb-6", className)}
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
