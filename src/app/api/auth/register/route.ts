import { createHmac } from "node:crypto";

import { NextResponse } from "next/server";

import { issueSessionCookies } from "@/shared/api/account";
import { isAuthEnvConfigured } from "@/shared/api/auth-session";
import { getSql } from "@/shared/api/db";
import {
  normalizeSignInName,
  validateDisplayName,
  validateEmail,
  validateUsername,
} from "@/shared/lib/account-fields";
import { validateNewPassword } from "@/shared/lib/password-policy";

export const dynamic = "force-dynamic";

/** Public sign-up limits (see db/migrations/2026-10-signup.sql). */
const MAX_ATTEMPTS_PER_IP_HOUR = 20;
const MAX_ACCOUNTS_PER_IP_HOUR = 3;
const MAX_ACCOUNTS_PER_DAY = 50;

function jsonError(message: string, status: number, field?: string) {
  return NextResponse.json({ error: message, ...(field ? { field } : {}) }, { status });
}

/** First hop of `x-forwarded-for` (set by Vercel), HMAC'd so raw IPs are never stored. */
function clientIpHash(req: Request): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return createHmac("sha256", process.env.AUTH_SECRET!.trim()).update(ip).digest("base64url");
}

type Limits = { ip_attempts: number; ip_created: number; day_created: number };

/** Create an account (empty data) and sign it in. */
export async function POST(req: Request) {
  if (!isAuthEnvConfigured()) {
    return jsonError("Sign-up is not available", 503);
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return jsonError("Invalid body", 400);
  }

  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string) : "");
  // Hidden field a person never fills in; bots usually do.
  if (str("website")) {
    return jsonError("Couldn't create the account", 400);
  }

  const username = normalizeSignInName(str("username"));
  const email = normalizeSignInName(str("email"));
  const displayName = str("displayName").trim();
  const password = str("password");

  const sql = getSql();
  const ipHash = clientIpHash(req);
  const recordAttempt = (succeeded: boolean) =>
    sql`INSERT INTO wealthtracker_signup_attempts (ip_hash, succeeded) VALUES (${ipHash}, ${succeeded})`;

  try {
    await sql`DELETE FROM wealthtracker_signup_attempts WHERE created_at < now() - interval '1 day'`;
    const [limits] = (await sql`
      SELECT
        count(*) FILTER (WHERE ip_hash = ${ipHash} AND created_at > now() - interval '1 hour')::int AS ip_attempts,
        count(*) FILTER (WHERE ip_hash = ${ipHash} AND succeeded AND created_at > now() - interval '1 hour')::int AS ip_created,
        count(*) FILTER (WHERE succeeded)::int AS day_created
      FROM wealthtracker_signup_attempts
    `) as Limits[];
    if (limits.ip_attempts >= MAX_ATTEMPTS_PER_IP_HOUR || limits.ip_created >= MAX_ACCOUNTS_PER_IP_HOUR) {
      return jsonError("Too many sign-ups from this network. Try again in an hour.", 429);
    }
    if (limits.day_created >= MAX_ACCOUNTS_PER_DAY) {
      return jsonError("Sign-ups are paused for today. Try again tomorrow.", 429);
    }

    const invalid =
      (validateUsername(username) && { field: "username", error: validateUsername(username)! }) ||
      (validateDisplayName(displayName) && { field: "displayName", error: validateDisplayName(displayName)! }) ||
      (validateEmail(email) && { field: "email", error: validateEmail(email)! }) ||
      (validateNewPassword(password, { username, email }) && {
        field: "password",
        error: validateNewPassword(password, { username, email })!,
      });
    if (invalid) {
      await recordAttempt(false);
      return jsonError(invalid.error, 400, invalid.field);
    }

    // Sign-in looks names up as username OR email, so neither may collide with any account's.
    const taken = (await sql`
      SELECT
        bool_or(username = ${username} OR email = ${username}) AS username_taken,
        bool_or(${email} <> '' AND (username = ${email} OR email = ${email})) AS email_taken
      FROM wealthtracker_users
    `) as { username_taken: boolean | null; email_taken: boolean | null }[];
    if (taken[0]?.username_taken) {
      await recordAttempt(false);
      return jsonError("That username is taken.", 409, "username");
    }
    if (taken[0]?.email_taken) {
      await recordAttempt(false);
      return jsonError("That email is already used by another account.", 409, "email");
    }

    let created: { id: string }[];
    try {
      created = (await sql`
        INSERT INTO wealthtracker_users (username, display_name, email, password_hash)
        VALUES (${username}, ${displayName || null}, ${email || null}, crypt(${password}, gen_salt('bf', 12)))
        RETURNING id::text AS id
      `) as { id: string }[];
    } catch (e) {
      // Lost a race with a sign-up for the same name.
      if ((e as { code?: string }).code === "23505") {
        await recordAttempt(false);
        return jsonError("That username or email is already used.", 409);
      }
      throw e;
    }
    await recordAttempt(true);

    const res = NextResponse.json({ ok: true });
    await issueSessionCookies(res, { sub: created[0]!.id, name: displayName || username });
    return res;
  } catch (e) {
    console.error("[wealthtracker] sign-up failed", e);
    return jsonError("Sign-up is unavailable right now", 500);
  }
}
