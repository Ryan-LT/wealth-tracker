import { NextResponse } from "next/server";

import {
  SESSION_MAX_AGE_SEC,
  WT_SESSION_COOKIE,
  WT_USER_COOKIE,
  createSessionToken,
  encodeUserCookie,
  isAuthEnvConfigured,
} from "@/shared/api/auth-session";
import { getSql } from "@/shared/api/db";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

type UserRow = { id: string; username: string; display_name: string | null };

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
  if (username.length > 64 || password.length > 256) {
    return jsonError("Invalid username or password", 401);
  }

  let user: UserRow | undefined;
  try {
    // bcrypt check runs in Postgres (pgcrypto); see db/create-user.sql.
    const rows = (await getSql()`
      SELECT id::text AS id, username, display_name
      FROM wealthtracker_users
      WHERE username = lower(trim(${username}))
        AND password_hash = crypt(${password}, password_hash)
    `) as UserRow[];
    user = rows[0];
  } catch (e) {
    console.error("[wealthtracker] login query failed", e);
    return jsonError("Sign-in is unavailable right now", 500);
  }

  if (!user) {
    return jsonError("Invalid username or password", 401);
  }

  const claims = { sub: user.id, name: user.display_name?.trim() || user.username };
  const secret = process.env.AUTH_SECRET!.trim();
  const token = await createSessionToken(secret, claims);

  const cookie = {
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
    secure: process.env.NODE_ENV === "production",
  };
  const res = NextResponse.json({ ok: true });
  res.cookies.set(WT_SESSION_COOKIE, token, { ...cookie, httpOnly: true });
  res.cookies.set(WT_USER_COOKIE, encodeUserCookie(claims), { ...cookie, httpOnly: false });
  return res;
}
