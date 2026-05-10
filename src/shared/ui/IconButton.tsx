import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib";

import { MaterialIcon } from "./MaterialIcon";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string;
  label: string;
  filled?: boolean;
  size?: number;
};

/**
 * Round, transparent icon button used for the topbar bell / account-circle
 * actions and inline-row "edit" / "delete" buttons.
 */
export function IconButton({
  icon,
  label,
  filled,
  size,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center",
        "text-on-surface-variant hover:bg-surface-container-low transition-colors",
        "cursor-pointer active:opacity-80",
        className,
      )}
      {...rest}
    >
      <MaterialIcon name={icon} filled={filled} size={size} />
    </button>
  );
}
