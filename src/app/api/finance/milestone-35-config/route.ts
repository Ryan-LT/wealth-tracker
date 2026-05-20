import { NextResponse } from "next/server";

import { resolveUsdVndRate } from "@/shared/api/usd-vnd-exchange-rate";
import {
  DEFAULT_MILESTONE_USD,
  parseIsoDateOnly,
  thirtyFifthBirthday,
} from "@/shared/lib/milestone-35-projection";

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

export async function GET() {
  const birthRaw = process.env.USER_DATE_OF_BIRTH?.trim();
  const dob = birthRaw ? parseIsoDateOnly(birthRaw) : null;
  const milestoneUsdRaw = process.env.WEALTH_MILESTONE_TARGET_USD?.trim();
  const milestoneUsdParsed = milestoneUsdRaw ? Number(milestoneUsdRaw) : DEFAULT_MILESTONE_USD;
  const targetUsd =
    Number.isFinite(milestoneUsdParsed) && milestoneUsdParsed > 0
      ? milestoneUsdParsed
      : DEFAULT_MILESTONE_USD;

  const fx = await resolveUsdVndRate();
  const vndPerUsd = fx?.vndPerUsd ?? null;

  const real = readAnnualRealReturn();

  const fxPayload = fx
    ? {
        vndPerUsdSource: fx.source,
        fxFetchedAtIso: fx.fetchedAtIso,
        fxApiLastUpdateIso: fx.apiLastUpdateIso,
      }
    : {
        vndPerUsdSource: null,
        fxFetchedAtIso: null,
        fxApiLastUpdateIso: null,
      };

  if (!dob) {
    return NextResponse.json({
      ok: false as const,
      missing: "USER_DATE_OF_BIRTH" as const,
      annualRealRate: real.rate,
      realRateSource: real.source,
      targetUsd,
      targetVnd: vndPerUsd !== null ? Math.round(targetUsd * vndPerUsd) : null,
      vndPerUsd,
      ...fxPayload,
    });
  }

  const deadline = thirtyFifthBirthday(dob);

  if (vndPerUsd === null) {
    return NextResponse.json({
      ok: false as const,
      missing: "FX_RATE" as const,
      annualRealRate: real.rate,
      realRateSource: real.source,
      targetUsd,
      deadlineIso: deadline.toISOString(),
      vndPerUsd: null,
      ...fxPayload,
    });
  }

  return NextResponse.json({
    ok: true as const,
    deadlineIso: deadline.toISOString(),
    targetUsd,
    targetVnd: Math.round(targetUsd * vndPerUsd),
    vndPerUsd,
    annualRealRate: real.rate,
    realRateSource: real.source,
    ...fxPayload,
  });
}
