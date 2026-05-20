import { neon } from "@neondatabase/serverless";

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url?.trim()) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

/** When `DATABASE_URL` is unset, FX caching and other optional DB paths can skip gracefully. */
export function tryGetSql(): ReturnType<typeof neon> | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  return neon(url);
}
