import { NextResponse } from "next/server";

import { resolveUsdVndRate } from "@/shared/api/usd-vnd-exchange-rate";

export const dynamic = "force-dynamic";

function readAnnualRealReturn(): { rate: number; source: "default" | "env" } {
  const rawEnv = process.env.REAL_RETURN_ANNUAL?.trim();
  if (rawEnv) {
    const n = Number(rawEnv);
    if (Number.isFinite(n) && n >= -0.08 && n <= 0.25) {
      return { rate: n, source: "env" };
    }
  }
  return { rate: 0.025, source: "default" };
}

/**
 * Shared inputs for the net-worth milestone (FX rate, real return). Each user's
 * birth date, target and age live in their own `preferences` table.
 */
export async function GET() {
  const fx = await resolveUsdVndRate();
  const real = readAnnualRealReturn();

  return NextResponse.json({
    vndPerUsd: fx?.vndPerUsd ?? null,
    vndPerUsdSource: fx?.source ?? null,
    fxFetchedAtIso: fx?.fetchedAtIso ?? null,
    fxApiLastUpdateIso: fx?.apiLastUpdateIso ?? null,
    annualRealRate: real.rate,
    realRateSource: real.source,
  });
}
