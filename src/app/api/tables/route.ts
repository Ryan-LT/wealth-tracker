import { isTableKey } from "@/shared/storage/tableKeys";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

type Row = { key: string; value: unknown };

/** All app tables from Neon (missing keys → client uses seeds). */
export async function GET() {
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT key, value
      FROM wealthtracker_kv
    `) as Row[];

    const tables: Record<string, unknown> = {};
    for (const row of rows) {
      if (isTableKey(row.key)) {
        tables[row.key] = row.value;
      }
    }
    return Response.json({ tables });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Database error";
    return jsonError(message, 500);
  }
}

/** Upsert one or more tables (partial updates allowed). */
export async function PUT(req: Request) {
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
        INSERT INTO wealthtracker_kv (key, value, updated_at)
        VALUES (${key}, ${payload}::jsonb, now())
        ON CONFLICT (key)
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
