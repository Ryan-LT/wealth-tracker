import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  SESSION_MAX_AGE_SEC,
  WT_SESSION_COOKIE,
  createSessionToken,
  isAuthEnvConfigured,
} from "@/shared/api/auth-session";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function safeEqualStr(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ba.length !== bb.length) {
      return false;
    }
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!isAuthEnvConfigured()) {
    return jsonError("Auth is not configured on the server", 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("Invalid body", 400);
  }

  const username = (body as { username?: unknown }).username;
  const password = (body as { password?: unknown }).password;
  if (typeof username !== "string" || typeof password !== "string") {
    return jsonError("username and password are required", 400);
  }

  const expectedUser = process.env.AUTH_USERNAME!.trim();
  const expectedPass = process.env.AUTH_PASSWORD!;
  if (!safeEqualStr(username, expectedUser) || !safeEqualStr(password, expectedPass)) {
    return jsonError("Invalid username or password", 401);
  }

  const secret = process.env.AUTH_SECRET!.trim();
  const token = await createSessionToken(secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(WT_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
