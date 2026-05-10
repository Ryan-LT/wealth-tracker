"use client";

import type { RealEstateProperty } from "@/shared/storage";
import { MaterialIcon, MoneyInput } from "@/shared/ui";

type PropertyRowProps = {
  property: RealEstateProperty;
  onChange: (next: RealEstateProperty) => void;
};

export function PropertyRow({ property, onChange }: PropertyRowProps) {
  const badgeIcon = property.badge.kind === "growth" ? "trending_up" : "payments";

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-surface border border-outline-variant rounded-DEFAULT hover:card-elevation transition-shadow">
      <div className="flex items-start gap-4 mb-4 sm:mb-0">
        <div className="w-12 h-12 bg-secondary/10 rounded flex items-center justify-center text-secondary shrink-0">
          <MaterialIcon name={property.icon} />
        </div>
        <div>
          <h4 className="font-body-lg text-body-lg text-primary font-medium">{property.name}</h4>
          <p className="font-body-md text-body-md text-on-surface-variant">{property.address}</p>
          <p className="font-label-sm text-label-sm text-secondary mt-1 flex items-center gap-1">
            <MaterialIcon name={badgeIcon} size={14} /> {property.badge.label}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <MoneyInput
          label="Est. Value"
          value={property.estValue}
          onChange={(estValue) => onChange({ ...property, estValue })}
          className="w-48"
        />
        <button
          type="button"
          aria-label={`Edit ${property.name}`}
          className="p-2 text-on-surface-variant hover:text-primary transition-colors"
        >
          <MaterialIcon name="edit" />
        </button>
      </div>
    </div>
  );
}
