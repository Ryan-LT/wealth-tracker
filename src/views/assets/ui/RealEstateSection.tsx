"use client";

import { formatVnd } from "@/shared/lib";
import type { RealEstateProperty } from "@/shared/storage";
import { Card, SectionHeader } from "@/shared/ui";

import { PropertyRow } from "./PropertyRow";

type RealEstateSectionProps = {
  properties: RealEstateProperty[];
  onChange: (next: RealEstateProperty[]) => void;
};

export function RealEstateSection({ properties, onChange }: RealEstateSectionProps) {
  const total = properties.reduce((sum, p) => sum + p.estValue, 0);

  function updateOne(updated: RealEstateProperty) {
    onChange(properties.map((p) => (p.id === updated.id ? updated : p)));
  }

  return (
    <Card variant="section" className="p-6">
      <SectionHeader
        title="Real Estate"
        subtitle="Property Holdings & Values"
        end={
          <>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Total Value
            </p>
            <p className="font-data-tabular text-[24px] leading-[32px] font-semibold text-primary">
              {formatVnd(total)}
            </p>
          </>
        }
      />
      <div className="space-y-4">
        {properties.map((property) => (
          <PropertyRow key={property.id} property={property} onChange={updateOne} />
        ))}
      </div>
    </Card>
  );
}
