import { NextResponse } from "next/server";

import { checkPassword, displayNameOf, issueSessionCookies } from "@/shared/api/account";
import { isAuthEnvConfigured } from "@/shared/api/auth-session";
import { messagesFor } from "@/shared/i18n/active";
import { errorText, type ErrorCode } from "@/shared/i18n/error-text";

export const dynamic = "force-dynamic";

/** Errors carry a `code` for the client to translate, plus an English message. */
function jsonError(code: ErrorCode, status: number, field?: string) {
  return NextResponse.json({ error: errorText(messagesFor("en"), code), code, ...(field ? { field } : {}) }, { status });
}

export async function POST(req: Request) {
  if (!isAuthEnvConfigured()) {
    return jsonError("auth_not_configured", 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("invalid_body", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("invalid_body", 400);
  }

  // `username` holds the sign-in name: username or email.
  const username = (body as { username?: unknown }).username;
  const password = (body as { password?: unknown }).password;
  if (typeof username !== "string" || typeof password !== "string") {
    return jsonError("invalid_body", 400);
  }
  if (username.length > 254 || password.length > 256) {
    return jsonError("invalid_credentials", 401);
  }

  let check: Awaited<ReturnType<typeof checkPassword>>;
  try {
    check = await checkPassword({ identifier: username }, password);
  } catch (e) {
    console.error("[wealthtracker] login query failed", e);
    return jsonError("unavailable", 500);
  }

  if (check.result === "locked") {
    return jsonError("locked", 429);
  }
  if (check.result !== "ok") {
    return jsonError("invalid_credentials", 401);
  }

  const res = NextResponse.json({ ok: true });
  await issueSessionCookies(res, { sub: check.user.id, name: displayNameOf(check.user) });
  return res;
}
