"use client";

import type { RealEstateProperty } from "@/shared/storage";
import { MaterialIcon, MoneyInput } from "@/shared/ui";

type PropertyRowProps = {
  property: RealEstateProperty;
  onChange: (next: RealEstateProperty) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function PropertyRow({ property, onChange, onEdit, onDelete }: PropertyRowProps) {
  const badgeIcon = property.badge.kind === "growth" ? "trending_up" : "payments";

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 bg-surface border border-outline-variant rounded-DEFAULT transition-shadow hover:card-elevation">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-secondary/10 text-secondary">
          <MaterialIcon name={property.icon} />
        </div>
        <div className="min-w-0">
          <h4 className="font-body-lg text-body-lg font-medium text-primary">{property.name}</h4>
          <p className="font-body-md text-body-md text-on-surface-variant">{property.address}</p>
          <p className="mt-1 flex items-center gap-1 font-label-sm text-label-sm text-secondary">
            <MaterialIcon name={badgeIcon} size={14} /> {property.badge.label}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <MoneyInput
          label="Est. Value"
          value={property.estValue}
          onChange={(estValue) => onChange({ ...property, estValue })}
          className="w-48"
        />
        <button
          type="button"
          aria-label={`Edit ${property.name}`}
          onClick={onEdit}
          className="p-2 text-on-surface-variant transition-colors hover:text-secondary"
        >
          <MaterialIcon name="edit" />
        </button>
        <button
          type="button"
          aria-label={`Delete ${property.name}`}
          onClick={onDelete}
          className="p-2 text-on-surface-variant transition-colors hover:text-error"
        >
          <MaterialIcon name="delete" />
        </button>
      </div>
    </div>
  );
}
