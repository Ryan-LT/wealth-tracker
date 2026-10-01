/** Response contract of `GET /api/finance/milestone-35-config` (route unchanged). */
export type FxSource = "env" | "cache" | "exchangerate-api" | "stale_cache" | null;

export type MilestoneConfigOk = {
  ok: true;
  deadlineIso: string;
  targetUsd: number;
  targetVnd: number;
  vndPerUsd: number;
  annualRealRate: number;
  realRateSource: "default" | "env";
  vndPerUsdSource: FxSource;
  fxFetchedAtIso: string | null;
  fxApiLastUpdateIso: string | null;
};

export type MilestoneConfigPartial = {
  ok: false;
  missing: "USER_DATE_OF_BIRTH" | "FX_RATE";
  annualRealRate: number;
  realRateSource: "default" | "env";
  targetUsd: number;
  targetVnd: number | null;
  vndPerUsd: number | null;
  deadlineIso?: string;
  vndPerUsdSource: FxSource;
  fxFetchedAtIso: string | null;
  fxApiLastUpdateIso: string | null;
};

export type MilestoneConfigResponse = MilestoneConfigOk | MilestoneConfigPartial;
