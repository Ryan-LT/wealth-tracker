"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { assetCategoryLabel, categorySelectOptions, resolveAssetCategoryEmoji, type SettingsAsset } from "@/entities/settings-asset";
import { useI18n, type Messages } from "@/shared/i18n";
import { ComboboxField, MoneyField, SegmentedField, TextField } from "@/shared/ui/form";
import { Button } from "@/shared/ui/kit/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/kit/dialog";
import { Form } from "@/shared/ui/kit/form";

function makeSchema(f: Messages["assets"]["form"]) {
  return z.object({
    name: z.string().trim().min(1, f.nameRequired).max(80),
    category: z.string().trim().min(1, f.categoryRequired).max(40),
    liquidity: z.enum(["instant", "not_instant"]),
    currentValue: z.number().min(0),
  });
}

type Values = z.infer<ReturnType<typeof makeSchema>>;

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
  const { t } = useI18n();
  const f = t.assets.form;
  const schema = useMemo(() => makeSchema(f), [f]);
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
          <DialogTitle>{mode === "create" ? f.addTitle : f.editTitle}</DialogTitle>
          <DialogDescription>{f.description}</DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-4">
          <TextField control={form.control} name="name" label={f.name} placeholder={f.namePlaceholder} autoFocus={mode === "create"} />
          <ComboboxField
            control={form.control}
            name="category"
            label={f.category}
            options={options}
            allowCreate
            renderOption={(c) => (
              <span className="flex items-center gap-2">
                <span aria-hidden>{resolveAssetCategoryEmoji(c)}</span>
                {assetCategoryLabel(c)}
              </span>
            )}
            description={f.categoryDescription}
          />
          <SegmentedField
            control={form.control}
            name="liquidity"
            label={f.access}
            options={[
              { value: "instant", label: t.domain.liquidity.instant },
              { value: "not_instant", label: t.domain.liquidity.notInstant },
            ]}
            description={f.accessDescription}
          />
          <MoneyField control={form.control} name="currentValue" label={f.currentValue} />
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            {t.common.cancel}
          </Button>
          <Button type="submit">{mode === "create" ? f.submitAdd : t.common.saveChanges}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
