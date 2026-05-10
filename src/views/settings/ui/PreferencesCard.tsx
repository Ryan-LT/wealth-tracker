"use client";

import type { Preferences } from "@/shared/storage";
import { MaterialIcon } from "@/shared/ui";

type PreferencesCardProps = {
  preferences: Preferences;
  onChange: (next: Preferences) => void;
};

export function PreferencesCard({ preferences, onChange }: PreferencesCardProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg">
      <div className="p-stack-md border-b border-outline-variant bg-surface rounded-t-lg">
        <div className="flex items-center gap-stack-sm">
          <MaterialIcon name="settings" filled className="text-primary" />
          <h2 className="font-headline-md text-headline-md text-primary">Preferences</h2>
        </div>
      </div>
      <div className="p-stack-md flex flex-col gap-stack-md">
        <div className="flex justify-between items-center py-2 border-b border-surface-variant">
          <div>
            <h3 className="font-body-md text-body-md text-primary">Base Currency</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              All reports use this currency
            </p>
          </div>
          <span className="font-data-tabular text-data-tabular text-primary font-bold bg-surface-variant px-3 py-1 rounded">
            VND (₫)
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <div>
            <h3 className="font-body-md text-body-md text-primary">Date Format</h3>
          </div>
          <select
            value={preferences.dateFormat}
            onChange={(e) =>
              onChange({
                ...preferences,
                dateFormat: e.target.value as Preferences["dateFormat"],
              })
            }
            className="bg-surface-bright border border-outline-variant text-primary font-body-md text-body-md rounded p-1 focus:outline-none"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </section>
  );
}
