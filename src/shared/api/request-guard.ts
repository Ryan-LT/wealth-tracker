/**
 * Reject requests another site made the browser send (CSRF): a form or fetch
 * from elsewhere carries this site's cookies on top-level POSTs. Without this,
 * a page could sign a visitor into the attacker's account (login CSRF) and
 * collect whatever finances they then enter.
 *
 * `json`: also require `Content-Type: application/json`. HTML forms can't send
 * it, and a cross-origin fetch with it needs a CORS preflight this app never grants.
 *
 * `true` when the request must be refused.
 */
export function isCrossSiteRequest(req: Request, { json = false }: { json?: boolean } = {}): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site !== null) {
    if (site !== "same-origin" && site !== "none") return true;
  } else {
    // Older browsers: fall back to Origin (absent on same-origin GETs and non-browser clients).
    const origin = req.headers.get("origin");
    if (origin !== null && !isSameHost(origin, req)) return true;
  }
  if (json) {
    const type = req.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
    if (type !== "application/json") return true;
  }
  return false;
}

function isSameHost(origin: string, req: Request): boolean {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    // `Origin: null` (sandboxed frames, some redirects) or garbage.
    return false;
  }
}
