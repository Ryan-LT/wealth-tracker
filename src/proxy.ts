import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isAuthEnvConfigured, verifySessionToken, WT_SESSION_COOKIE } from "@/shared/api/auth-session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/swe-worker-") ||
    pathname.startsWith("/workbox-")
  ) {
    return NextResponse.next();
  }

  if (!isAuthEnvConfigured()) {
    return NextResponse.next();
  }

  const token = request.cookies.get(WT_SESSION_COOKIE)?.value ?? "";
  const secret = process.env.AUTH_SECRET!.trim();
  const ok = token.length > 0 && (await verifySessionToken(token, secret));

  if (pathname === "/login" || pathname.startsWith("/login/")) {
    if (ok) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/logout")) {
    return NextResponse.next();
  }

  if (!ok) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
