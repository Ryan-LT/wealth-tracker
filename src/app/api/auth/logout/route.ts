import { NextResponse } from "next/server";

import { WT_SESSION_COOKIE, WT_USER_COOKIE } from "@/shared/api/auth-session";
import { isCrossSiteRequest } from "@/shared/api/request-guard";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Other sites may not sign people out.
  if (isCrossSiteRequest(req)) {
    return NextResponse.json({ error: "Forbidden", code: "cross_site" }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  const expired = {
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  };
  res.cookies.set(WT_SESSION_COOKIE, "", { ...expired, httpOnly: true });
  res.cookies.set(WT_USER_COOKIE, "", { ...expired, httpOnly: false });
  return res;
}
