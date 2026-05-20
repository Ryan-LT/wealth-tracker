/** HttpOnly cookie set on successful login. */
export const WT_SESSION_COOKIE = "wt_session";

/** Default session length (also used for cookie Max-Age). */
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

function base64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]!);
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

function timingSafeEqualB64(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacSha256B64Url(payloadB64: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  return base64urlEncode(new Uint8Array(sig));
}

export async function createSessionToken(secret: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC;
  const payloadB64 = base64urlEncode(encoder.encode(JSON.stringify({ exp })));
  const sig = await hmacSha256B64Url(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  const dot = token.indexOf(".");
  if (dot < 1) {
    return false;
  }
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!payloadB64 || !sig) {
    return false;
  }
  const expected = await hmacSha256B64Url(payloadB64, secret);
  if (!timingSafeEqualB64(sig, expected)) {
    return false;
  }
  try {
    const json = new TextDecoder().decode(base64urlToBytes(payloadB64));
    const { exp } = JSON.parse(json) as { exp?: number };
    if (typeof exp !== "number") {
      return false;
    }
    return exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function isAuthEnvConfigured(): boolean {
  const user = process.env.AUTH_USERNAME?.trim();
  const pass = process.env.AUTH_PASSWORD;
  const secret = process.env.AUTH_SECRET?.trim();
  return Boolean(user && pass !== undefined && pass.length > 0 && secret);
}
