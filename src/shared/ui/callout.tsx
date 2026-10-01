import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import type { StatusTone } from "@/shared/lib/tone";

const toneStyles: Record<StatusTone, { box: string; icon: string; Icon: LucideIcon }> = {
  neutral: { box: "bg-muted/60", icon: "text-muted-foreground", Icon: Info },
  info: { box: "bg-info-muted", icon: "text-info", Icon: Info },
  success: { box: "bg-success-muted", icon: "text-success", Icon: CircleCheck },
  warning: { box: "bg-warning-muted", icon: "text-warning", Icon: TriangleAlert },
  danger: { box: "bg-danger-muted", icon: "text-danger", Icon: CircleAlert },
};

type CalloutProps = {
  tone?: StatusTone;
  title?: ReactNode;
  icon?: LucideIcon;
  className?: string;
  children?: ReactNode;
};

/** Inline note with a tone icon; text stays in foreground colours for contrast. */
export function Callout({ tone = "neutral", title, icon, className, children }: CalloutProps) {
  const s = toneStyles[tone];
  const Icon = icon ?? s.Icon;
  return (
    <div className={cn("flex gap-2.5 rounded-md px-3 py-2.5 text-sm", s.box, className)} role="note">
      <Icon className={cn("mt-0.5 size-4 shrink-0", s.icon)} aria-hidden />
      <div className="min-w-0">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? <div className={cn(title && "mt-0.5", "text-foreground/85")}>{children}</div> : null}
      </div>
    </div>
  );
}
