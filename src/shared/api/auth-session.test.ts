import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createSessionToken,
  encodeUserCookie,
  getSessionUser,
  isAuthEnvConfigured,
  verifySessionToken,
} from "@/shared/api/auth-session";

const secret = "test-secret";

function b64url(s: string) {
  return Buffer.from(s).toString("base64url");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("session tokens", () => {
  it("round-trips the user claims", async () => {
    const token = await createSessionToken(secret, { sub: "u-1", name: "Thịnh" });
    await expect(verifySessionToken(token, secret)).resolves.toEqual({ sub: "u-1", name: "Thịnh" });
  });

  it("rejects a token signed with another secret or tampered with", async () => {
    const token = await createSessionToken(secret, { sub: "u-1", name: "A" });
    await expect(verifySessionToken(token, "other")).resolves.toBeNull();
    const [, sig] = token.split(".");
    const forged = `${b64url(JSON.stringify({ sub: "u-2", name: "B", exp: 9_999_999_999 }))}.${sig}`;
    await expect(verifySessionToken(forged, secret)).resolves.toBeNull();
  });

  it("rejects expired tokens", async () => {
    const token = await createSessionToken(secret, { sub: "u-1", name: "A" });
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 31 * 24 * 3600 * 1000);
    await expect(verifySessionToken(token, secret)).resolves.toBeNull();
  });

  it("rejects single-user tokens from before accounts (no sub)", async () => {
    // Same HMAC scheme as the old `createSessionToken(secret)`.
    const payload = b64url(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = Buffer.from(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))).toString("base64url");
    await expect(verifySessionToken(`${payload}.${sig}`, secret)).resolves.toBeNull();
  });
});

describe("getSessionUser", () => {
  it("reads the session cookie from the request", async () => {
    vi.stubEnv("AUTH_SECRET", secret);
    const token = await createSessionToken(secret, { sub: "u-9", name: "N" });
    const req = new Request("http://x/api/tables", { headers: { cookie: `a=1; wt_session=${token}; wt_user=zz` } });
    await expect(getSessionUser(req)).resolves.toEqual({ sub: "u-9", name: "N" });
    await expect(getSessionUser(new Request("http://x/api/tables"))).resolves.toBeNull();
  });
});

describe("isAuthEnvConfigured", () => {
  it("requires a database and a secret", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("AUTH_SECRET", secret);
    expect(isAuthEnvConfigured()).toBe(false);
    vi.stubEnv("DATABASE_URL", "postgres://x");
    expect(isAuthEnvConfigured()).toBe(true);
  });
});

describe("encodeUserCookie", () => {
  it("is base64url JSON with the id and name", () => {
    const v = encodeUserCookie({ sub: "u-1", name: "Thịnh" });
    expect(JSON.parse(Buffer.from(v, "base64url").toString("utf8"))).toEqual({ id: "u-1", name: "Thịnh" });
  });
});
