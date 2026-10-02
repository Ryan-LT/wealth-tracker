/** Response contract of `GET /api/finance/milestone-35-config` (path kept for installed clients): shared FX inputs only. */
export type FxSource = "env" | "cache" | "exchangerate-api" | "stale_cache" | null;

export type MilestoneConfigResponse = {
  /** `null` when no FX rate is available (no API key and no cached rate). */
  vndPerUsd: number | null;
  vndPerUsdSource: FxSource;
  fxFetchedAtIso: string | null;
  fxApiLastUpdateIso: string | null;
  annualRealRate: number;
  realRateSource: "default" | "env";
};

/** Per-user milestone settings, stored as `preferences.milestone` (all optional). */
export type MilestoneSettings = {
  /** Date of birth, `YYYY-MM-DD`. */
  birthDate?: string;
  /** Net worth target in USD (default $1,000,000). */
  targetUsd?: number;
  /** Age to reach the target by (default 35). */
  targetAge?: number;
};

/** {@link MilestoneSettings} with defaults applied. */
export type ResolvedMilestoneSettings = {
  birthDate: Date | null;
  targetUsd: number;
  targetAge: number;
};
