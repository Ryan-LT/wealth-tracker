import { NextResponse } from "next/server";

import {
  checkPassword,
  displayNameOf,
  issueSessionCookies,
  LOCK_MINUTES,
  requireActiveUser,
} from "@/shared/api/account";
import { getSql } from "@/shared/api/db";
import { validateNewPassword } from "@/shared/lib/password-policy";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Change the signed-in user's password. Signs out every other device
 * (their sessions predate `password_changed_at`); this one gets a fresh session.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("Invalid body", 400);
  }
  const currentPassword = (body as { currentPassword?: unknown }).currentPassword;
  const newPassword = (body as { newPassword?: unknown }).newPassword;
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return jsonError("currentPassword and newPassword are required", 400);
  }

  try {
    const session = await requireActiveUser(req);
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const check = await checkPassword({ userId: session.sub }, currentPassword);
    if (check.result === "locked") {
      return jsonError(`Too many attempts. Try again in ${LOCK_MINUTES} minutes.`, 429);
    }
    if (check.result !== "ok") {
      return jsonError("Current password is incorrect", 400);
    }

    const problem = validateNewPassword(newPassword, {
      current: currentPassword,
      username: check.user.username,
      email: check.user.email,
    });
    if (problem) {
      return jsonError(problem, 400);
    }

    await getSql()`
      UPDATE wealthtracker_users
      SET password_hash = crypt(${newPassword}, gen_salt('bf', 12)),
          password_changed_at = date_trunc('second', now()),
          failed_attempts = 0,
          locked_until = NULL
      WHERE id = ${check.user.id}
    `;

    const res = NextResponse.json({ ok: true });
    await issueSessionCookies(res, { sub: check.user.id, name: displayNameOf(check.user) });
    return res;
  } catch (e) {
    console.error("[wealthtracker] password change failed", e);
    return jsonError("Couldn't change the password right now", 500);
  }
}
