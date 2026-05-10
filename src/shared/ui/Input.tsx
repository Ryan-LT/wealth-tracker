import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Optional label rendered above the field. */
  label?: string;
  /** Visual size — "sm" matches inline table inputs, "md" matches form fields. */
  inputSize?: "sm" | "md";
  /** Icon / glyph rendered absolutely on the left edge. */
  startAdornment?: ReactNode;
  containerClassName?: string;
  /** Right-align the value (used in money inputs). */
  alignRight?: boolean;
};

export function Input({
  label,
  inputSize = "md",
  startAdornment,
  containerClassName,
  className,
  alignRight = false,
  ...rest
}: InputProps) {
  const id = rest.id;

  return (
    <div className={cn("flex flex-col", containerClassName)}>
      {label ? (
        <label
          htmlFor={id}
          className="block font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        {startAdornment ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data-tabular text-data-tabular text-on-surface-variant pointer-events-none">
            {startAdornment}
          </span>
        ) : null}
        <input
          {...rest}
          className={cn(
            "w-full bg-surface-container-lowest border border-outline-variant rounded",
            "text-primary placeholder:text-on-surface-variant/60",
            "focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors",
            inputSize === "sm" ? "h-9 px-3 text-body-md font-body-md" : "h-10 px-3 text-body-md font-body-md",
            startAdornment && "pl-7",
            alignRight && "text-right font-data-tabular text-data-tabular",
            className,
          )}
        />
      </div>
    </div>
  );
}
