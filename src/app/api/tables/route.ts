import { getSessionUser } from "@/shared/api/auth-session";
import { getSql } from "@/shared/api/db";
import { isTableKey } from "@/shared/storage/table-keys";

export const dynamic = "force-dynamic";

/** Client header naming the account its pending edits belong to; must match the session. */
const USER_HEADER = "x-wt-user";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

type Row = { key: string; value: unknown };

/** The signed-in user's tables (missing keys → client uses empty seeds). */
export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT key, value
      FROM wealthtracker_kv
      WHERE user_id = ${user.sub}
    `) as Row[];

    const tables: Record<string, unknown> = {};
    for (const row of rows) {
      if (isTableKey(row.key)) {
        tables[row.key] = row.value;
      }
    }
    return Response.json({ userId: user.sub, tables });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Database error";
    return jsonError(message, 500);
  }
}

/** Upsert one or more of the signed-in user's tables (partial updates allowed). */
export async function PUT(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return jsonError("Unauthorized", 401);
  }
  // Edits cached on this device for another account must never land in this one.
  if (req.headers.get(USER_HEADER) !== user.sub) {
    return jsonError("These changes belong to a different account", 409);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError('Expected object with "tables" record', 400);
  }

  const tables = (body as { tables?: unknown }).tables;
  if (!tables || typeof tables !== "object" || Array.isArray(tables)) {
    return jsonError('"tables" must be an object', 400);
  }

  const entries = Object.entries(tables as Record<string, unknown>).filter(
    ([k, v]) => isTableKey(k) && v !== undefined,
  );

  try {
    const sql = getSql();
    for (const [key, value] of entries) {
      const payload = JSON.stringify(value);
      await sql`
        INSERT INTO wealthtracker_kv (user_id, key, value, updated_at)
        VALUES (${user.sub}, ${key}, ${payload}::jsonb, now())
        ON CONFLICT (user_id, key)
        DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = EXCLUDED.updated_at
      `;
    }
    return Response.json({ ok: true, written: entries.map(([k]) => k) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Database error";
    return jsonError(message, 500);
  }
}
