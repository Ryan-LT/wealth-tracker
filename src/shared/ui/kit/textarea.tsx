import * as React from "react";

import { cn } from "@/shared/lib/cn";
import { fieldClassName } from "@/shared/ui/kit/input";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldClassName, "flex field-sizing-content min-h-16 px-3 py-2", className)}
      {...props}
    />
  );
}

export { Textarea };
