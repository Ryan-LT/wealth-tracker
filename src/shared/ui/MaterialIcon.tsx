import type { CSSProperties } from "react";

import { cn } from "@/shared/lib";

type MaterialIconProps = {
  name: string;
  filled?: boolean;
  /** Pixel size override; otherwise inherits parent font-size. */
  size?: number;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  className?: string;
};

export function MaterialIcon({
  name,
  filled = false,
  size,
  weight,
  className,
}: MaterialIconProps) {
  const style: CSSProperties = {};
  if (size) style.fontSize = `${size}px`;
  if (filled || weight) {
    const f = filled ? 1 : 0;
    const w = weight ?? 400;
    style.fontVariationSettings = `"FILL" ${f}, "wght" ${w}, "GRAD" 0, "opsz" 24`;
  }

  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined", filled && "is-filled", className)}
      style={style}
    >
      {name}
    </span>
  );
}
