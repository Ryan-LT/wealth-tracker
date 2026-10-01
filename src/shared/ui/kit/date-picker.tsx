"use client";

import { format, parse } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/kit/button";
import { Calendar } from "@/shared/ui/kit/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";

type DatePickerProps = {
  /** `yyyy-MM-dd` string (or empty). */
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Show a "Clear" action that sets the value to "". */
  clearable?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
};

function parseValue(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = parse(value.trim().split("T")[0], "yyyy-MM-dd", new Date());
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Wide year range so far-future goal dates are reachable from the dropdowns. */
function calendarNavBounds(reference = new Date()) {
  const y = reference.getFullYear();
  return { startMonth: new Date(y - 100, 0), endMonth: new Date(y + 100, 11) };
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  clearable,
  className,
  id,
  ...rest
}: DatePickerProps) {
  const selected = parseValue(value);
  const [open, setOpen] = React.useState(false);
  const { startMonth, endMonth } = calendarNavBounds();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={rest["aria-invalid"]}
          className={cn("w-full justify-start px-3 font-normal", !selected && "text-muted-foreground", className)}
        >
          <CalendarIcon className="text-muted-foreground" />
          {selected ? format(selected, "d MMM yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => {
            if (d) onChange(format(d, "yyyy-MM-dd"));
            setOpen(false);
          }}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          autoFocus
        />
        {clearable && selected ? (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <X />
              Clear date
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
