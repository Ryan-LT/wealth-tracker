"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { isValidElement, useState, type ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { useI18n } from "@/shared/i18n";
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
  /**
   * Text shown for an option, also matched when searching (e.g. a translated
   * category name). Defaults to the text of `renderOption`.
   */
  getOptionLabel?: (value: string) => string;
  className?: string;
};

/** Readable text of a rendered option (skips `aria-hidden` parts such as emoji), for search. */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  if (isValidElement<{ children?: ReactNode; "aria-hidden"?: unknown }>(node)) {
    const hidden = node.props["aria-hidden"];
    return hidden === true || hidden === "true" ? "" : textOf(node.props.children);
  }
  return "";
}

/** Searchable single-select over string options, optionally creating new values. */
export function ComboboxField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  description,
  options,
  allowCreate,
  placeholder,
  renderOption,
  getOptionLabel,
  className,
}: ComboboxFieldProps<T, N>) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const labelOf = (o: string) => (getOptionLabel ? getOptionLabel(o) : renderOption ? textOf(renderOption(o)).replace(/\s+/g, " ").trim() : o);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value: string = field.value ?? "";
        const query = search.trim();
        const q = query.toLowerCase();
        const exists = options.some((o) => o.toLowerCase() === q || labelOf(o).toLowerCase() === q);
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
                    <span className="truncate">{value ? (renderOption ? renderOption(value) : value) : (placeholder ?? t.shell.ui.select)}</span>
                    <ChevronsUpDown className="text-muted-foreground" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                <Command
                  // Plain substring matching (value or displayed label): fuzzy scores made Enter pick an unrelated option.
                  filter={(itemValue, term, keywords) => {
                    const needle = term.trim().toLowerCase();
                    return [itemValue, ...(keywords ?? [])].some((v) => v.toLowerCase().includes(needle)) ? 1 : 0;
                  }}
                >
                  <CommandInput placeholder={t.shell.ui.searchPlaceholder} value={search} onValueChange={setSearch} />
                  <CommandList className="max-h-64">
                    {allowCreate && query && !exists ? null : <CommandEmpty>{t.shell.ui.noMatch}</CommandEmpty>}
                    <CommandGroup>
                      {options.map((o) => (
                        <CommandItem key={o} value={o} keywords={[labelOf(o)]} onSelect={() => choose(o)}>
                          <Check className={cn(o === value ? "opacity-100" : "opacity-0")} />
                          {renderOption ? renderOption(o) : o}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {allowCreate && query && !exists ? (
                      <CommandGroup forceMount>
                        <CommandItem value={`__create__ ${query}`} onSelect={() => choose(query)}>
                          <Plus />
                          {t.shell.ui.create({ query })}
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
