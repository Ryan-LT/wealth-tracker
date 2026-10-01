"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/kit/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/ui/kit/command";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/kit/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";

type ComboboxFieldProps<T extends FieldValues, N extends FieldPath<T>> = {
  control: Control<T>;
  name: N;
  label: ReactNode;
  description?: ReactNode;
  options: string[];
  /** Offer "Create '…'" when the search text matches no option. */
  allowCreate?: boolean;
  placeholder?: string;
  renderOption?: (value: string) => ReactNode;
  className?: string;
};

/** Searchable single-select over string options, optionally creating new values. */
export function ComboboxField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  options,
  allowCreate,
  placeholder = "Select…",
  renderOption,
  className,
}: ComboboxFieldProps<T, N>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value: string = field.value ?? "";
        const query = search.trim();
        const exists = options.some((o) => o.toLowerCase() === query.toLowerCase());
        const choose = (next: string) => {
          field.onChange(next);
          setSearch("");
          setOpen(false);
        };
        return (
          <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between px-3 font-normal", !value && "text-muted-foreground")}
                  >
                    <span className="truncate">{value ? (renderOption ? renderOption(value) : value) : placeholder}</span>
                    <ChevronsUpDown className="text-muted-foreground" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                <Command
                  // Plain substring matching: fuzzy scores made Enter pick an unrelated option.
                  filter={(itemValue, term) => (itemValue.toLowerCase().includes(term.trim().toLowerCase()) ? 1 : 0)}
                >
                  <CommandInput placeholder="Search…" value={search} onValueChange={setSearch} />
                  <CommandList className="max-h-64">
                    {allowCreate && query && !exists ? null : <CommandEmpty>No match.</CommandEmpty>}
                    <CommandGroup>
                      {options.map((o) => (
                        <CommandItem key={o} value={o} onSelect={() => choose(o)}>
                          <Check className={cn(o === value ? "opacity-100" : "opacity-0")} />
                          {renderOption ? renderOption(o) : o}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {allowCreate && query && !exists ? (
                      <CommandGroup forceMount>
                        <CommandItem value={`__create__ ${query}`} onSelect={() => choose(query)}>
                          <Plus />
                          Create “{query}”
                        </CommandItem>
                      </CommandGroup>
                    ) : null}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {description ? <FormDescription>{description}</FormDescription> : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
