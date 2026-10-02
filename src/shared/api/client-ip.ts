import { createHmac } from "node:crypto";

/** First hop of `x-forwarded-for` (set by Vercel), HMAC'd so raw IPs are never stored. */
export function clientIpHash(req: Request): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return createHmac("sha256", process.env.AUTH_SECRET!.trim()).update(ip).digest("base64url");
}
