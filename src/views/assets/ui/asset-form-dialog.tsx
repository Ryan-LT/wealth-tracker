"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { categorySelectOptions, resolveAssetCategoryEmoji, type SettingsAsset } from "@/entities/settings-asset";
import { ComboboxField, MoneyField, SegmentedField, TextField } from "@/shared/ui/form";
import { Button } from "@/shared/ui/kit/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/kit/dialog";
import { Form } from "@/shared/ui/kit/form";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  category: z.string().trim().min(1, "Pick or create a category").max(40),
  liquidity: z.enum(["instant", "not_instant"]),
  currentValue: z.number().min(0),
});

type Values = z.infer<typeof schema>;

type AssetFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  asset: SettingsAsset | null;
  categoryOptions: string[];
  onSubmit: (asset: SettingsAsset) => void;
};

export function AssetFormDialog({ open, onOpenChange, asset, ...rest }: AssetFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        {asset ? (
          <AssetForm
            key={asset.id}
            asset={asset}
            mode={rest.mode}
            categoryOptions={rest.categoryOptions}
            onCancel={() => onOpenChange(false)}
            onSubmit={(next) => {
              rest.onSubmit(next);
              onOpenChange(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AssetForm({
  asset,
  mode,
  categoryOptions,
  onCancel,
  onSubmit,
}: {
  asset: SettingsAsset;
  mode: "create" | "edit";
  categoryOptions: string[];
  onCancel: () => void;
  onSubmit: (asset: SettingsAsset) => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: asset.name,
      category: asset.category || "Cash",
      liquidity: asset.liquidity === "not_instant" ? "not_instant" : "instant",
      currentValue: asset.currentValue,
    },
  });
  const category = useWatch({ control: form.control, name: "category" });
  const options = useMemo(() => categorySelectOptions(categoryOptions, category), [categoryOptions, category]);

  return (
    <Form {...form}>
      <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit((v) => onSubmit({ ...asset, ...v }))}>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add asset" : "Edit asset"}</DialogTitle>
          <DialogDescription>Assets count toward net worth and can fund goal plans.</DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-4">
          <TextField control={form.control} name="name" label="Name" placeholder="e.g. Emergency fund, apartment" autoFocus={mode === "create"} />
          <ComboboxField
            control={form.control}
            name="category"
            label="Category"
            options={options}
            allowCreate
            renderOption={(c) => (
              <span className="flex items-center gap-2">
                <span aria-hidden>{resolveAssetCategoryEmoji(c)}</span>
                {c}
              </span>
            )}
            description="Type a new name to create your own category."
          />
          <SegmentedField
            control={form.control}
            name="liquidity"
            label="Access"
            options={[
              { value: "instant", label: "Instant" },
              { value: "not_instant", label: "Not instant" },
            ]}
            description="Instant: cash or equivalents you can spend now. Not instant: locked, term deposits, property."
          />
          <MoneyField control={form.control} name="currentValue" label="Current value" />
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{mode === "create" ? "Add asset" : "Save changes"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
