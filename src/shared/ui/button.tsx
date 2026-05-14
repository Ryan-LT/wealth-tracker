"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline-secondary";
type Size = "sm" | "md";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  startIcon?: ReactNode;
};

const VARIANT_MAP = {
  primary: "default",
  secondary: "secondary",
  ghost: "ghost",
  "outline-secondary": "outline",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  startIcon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <ShadcnButton
      type={rest.type ?? "button"}
      variant={VARIANT_MAP[variant]}
      size={size === "sm" ? "sm" : "default"}
      className={cn(block && "w-full", className)}
      {...rest}
    >
      {startIcon}
      {children}
    </ShadcnButton>
  );
}
