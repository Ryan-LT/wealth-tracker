import { NextResponse } from "next/server";

import { checkPassword, displayNameOf, issueSessionCookies, LOCK_MINUTES } from "@/shared/api/account";
import { isAuthEnvConfigured } from "@/shared/api/auth-session";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
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

  // `username` holds the sign-in name: username or email.
  const username = (body as { username?: unknown }).username;
  const password = (body as { password?: unknown }).password;
  if (typeof username !== "string" || typeof password !== "string") {
    return jsonError("username and password are required", 400);
  }
  if (username.length > 254 || password.length > 256) {
    return jsonError("Invalid username or password", 401);
  }

  let check: Awaited<ReturnType<typeof checkPassword>>;
  try {
    check = await checkPassword({ identifier: username }, password);
  } catch (e) {
    console.error("[wealthtracker] login query failed", e);
    return jsonError("Sign-in is unavailable right now", 500);
  }

  if (check.result === "locked") {
    return jsonError(`Too many attempts. Try again in ${LOCK_MINUTES} minutes.`, 429);
  }
  if (check.result !== "ok") {
    return jsonError("Invalid username or password", 401);
  }

  const res = NextResponse.json({ ok: true });
  await issueSessionCookies(res, { sub: check.user.id, name: displayNameOf(check.user) });
  return res;
}
