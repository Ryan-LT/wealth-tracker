import { describe, expect, it } from "vitest";

import { isCrossSiteRequest } from "./request-guard";

function req(headers: Record<string, string>): Request {
  return new Request("https://cairn.example/api/auth/login", {
    method: "POST",
    headers: { host: "cairn.example", ...headers },
  });
}

describe("isCrossSiteRequest", () => {
  it("allows same-origin JSON fetches", () => {
    const r = req({ "sec-fetch-site": "same-origin", "content-type": "application/json" });
    expect(isCrossSiteRequest(r, { json: true })).toBe(false);
  });

  it("refuses other sites by Sec-Fetch-Site", () => {
    expect(isCrossSiteRequest(req({ "sec-fetch-site": "cross-site", "content-type": "application/json" }))).toBe(true);
    expect(isCrossSiteRequest(req({ "sec-fetch-site": "same-site" }))).toBe(true);
  });

  it("falls back to Origin when Sec-Fetch-Site is missing", () => {
    expect(isCrossSiteRequest(req({ origin: "https://evil.example" }))).toBe(true);
    expect(isCrossSiteRequest(req({ origin: "null" }))).toBe(true);
    expect(isCrossSiteRequest(req({ origin: "https://cairn.example" }))).toBe(false);
    expect(isCrossSiteRequest(req({ origin: "https://evil.example", "x-forwarded-host": "cairn.example" }))).toBe(true);
  });

  it("allows clients that send neither header (curl, scripts)", () => {
    expect(isCrossSiteRequest(req({}))).toBe(false);
  });

  it("requires a JSON content type when asked", () => {
    const form = req({ "sec-fetch-site": "same-origin", "content-type": "text/plain" });
    expect(isCrossSiteRequest(form, { json: true })).toBe(true);
    expect(isCrossSiteRequest(form)).toBe(false);
    const charset = req({ "sec-fetch-site": "same-origin", "content-type": "application/json; charset=utf-8" });
    expect(isCrossSiteRequest(charset, { json: true })).toBe(false);
  });
});
