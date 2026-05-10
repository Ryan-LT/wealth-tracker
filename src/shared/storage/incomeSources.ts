export type IncomeSourceKind = "active" | "passive";

export type IncomeSource = {
  id: string;
  kind: IncomeSourceKind;
  name: string;
  details: string;
  icon: string;
  monthly: number;
  /** "Active" / "Passive" badge for the Settings page; payment day-of-month. */
  paymentDay?: number;
  paymentEntity?: string;
};

export const INCOME_SOURCES_SEED: IncomeSource[] = [
  {
    id: "primary-tech",
    kind: "active",
    name: "Primary Tech Role",
    details: "Acme Corp",
    icon: "work",
    monthly: 12_000_000,
    paymentEntity: "Tech Corp Inc.",
    paymentDay: 25,
  },
  {
    id: "consulting-retainer",
    kind: "active",
    name: "Consulting Retainer",
    details: "Various Clients",
    icon: "handshake",
    monthly: 3_500_000,
  },
  {
    id: "real-estate-rent",
    kind: "passive",
    name: "Real Estate Rent",
    details: "Unit 402, Downtown",
    icon: "apartment",
    monthly: 2_800_000,
    paymentEntity: "District 7 Apt",
    paymentDay: 5,
  },
  {
    id: "loan-interest",
    kind: "passive",
    name: "Loan Interest",
    details: "P2P Lending Portfolio",
    icon: "percent",
    monthly: 1_700_000,
  },
];

export type SettingsAsset = {
  id: string;
  name: string;
  category: string;
  currentValue: number;
};

export const SETTINGS_ASSETS_SEED: SettingsAsset[] = [
  {
    id: "primary-residence",
    name: "Primary Residence",
    category: "Real Estate",
    currentValue: 5_500_000_000,
  },
  {
    id: "techcombank-savings",
    name: "Techcombank Savings",
    category: "Cash",
    currentValue: 850_000_000,
  },
  {
    id: "ssi-securities",
    name: "SSI Securities Acct",
    category: "Investments",
    currentValue: 1_200_000_000,
  },
];
