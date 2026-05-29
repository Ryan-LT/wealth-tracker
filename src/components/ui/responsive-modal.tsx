import { cn } from "@/shared/lib";

/** Bottom drawer on viewports below `sm`; centered dialog from `sm` up. */
export function responsiveModalContentClass(className?: string) {
  return cn(
    "fixed z-50 grid w-full gap-4 bg-background shadow-lg outline-none",
    // Mobile: bottom sheet
    "max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[min(92dvh,100%)] max-sm:translate-x-0 max-sm:translate-y-0 max-sm:overflow-y-auto max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:border-t max-sm:p-5 max-sm:pb-[max(1.25rem,env(safe-area-inset-bottom))]",
    "max-sm:data-[state=closed]:animate-out max-sm:data-[state=closed]:duration-300 max-sm:data-[state=open]:animate-in max-sm:data-[state=open]:duration-300",
    "max-sm:data-[state=closed]:fade-out-0 max-sm:data-[state=open]:fade-in-0",
    "max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=open]:slide-in-from-bottom",
    // Desktop: centered modal
    "sm:top-[50%] sm:left-[50%] sm:max-h-[min(85vh,100%)] sm:max-w-[calc(100%-2rem)] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:overflow-y-auto sm:rounded-lg sm:border sm:p-6 sm:max-w-lg",
    "sm:data-[state=closed]:animate-out sm:data-[state=open]:animate-in sm:data-[state=closed]:fade-out-0 sm:data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:duration-200",
    className,
  );
}

export function ResponsiveModalHandle() {
  return (
    <div
      aria-hidden
      className="mx-auto -mt-0.5 mb-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25 sm:hidden"
    />
  );
}
