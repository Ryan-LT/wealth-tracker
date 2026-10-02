import { NextResponse } from "next/server";

import { WT_SESSION_COOKIE, WT_USER_COOKIE } from "@/shared/api/auth-session";

export const dynamic = "force-dynamic";

export async function POST() {
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
