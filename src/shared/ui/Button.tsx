import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

type Variant = "primary" | "secondary" | "ghost" | "outline-secondary";
type Size = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  startIcon?: ReactNode;
};

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-secondary text-on-secondary hover:opacity-90 disabled:opacity-50 transition-opacity",
  secondary:
    "bg-surface border border-outline-variant text-primary hover:bg-surface-container-low transition-colors",
  ghost: "text-on-surface-variant hover:bg-surface-container-low transition-colors",
  "outline-secondary":
    "border border-secondary text-secondary bg-transparent hover:bg-secondary/10 transition-colors",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-9 px-3 text-label-sm font-label-sm",
  md: "h-10 px-4 text-label-sm font-label-sm",
};

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
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded uppercase tracking-wider",
        "active:opacity-80 disabled:cursor-not-allowed",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        block && "w-full",
        className,
      )}
      {...rest}
    >
      {startIcon}
      {children}
    </button>
  );
}
