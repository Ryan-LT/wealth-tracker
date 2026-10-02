import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { codeInspectorPlugin } from "code-inspector-plugin";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
  // The default reload on reconnect would interrupt the offline-edit sync;
  // the app resyncs on reconnect itself (see OfflineStrip).
  reloadOnOnline: false,
});

const nextConfig: NextConfig = {
  experimental: {
    // Pages are static shells (data lives in the client store), so a
    // prefetched page stays valid for the whole session.
    staleTimes: { static: 3600 },
  },
  turbopack: {
    rules: {
      ...codeInspectorPlugin({
        bundler: "turbopack",
      }),
    },
  },
  async headers() {
    return [
      {
        // No framing (clickjacking), no MIME sniffing, no full URLs leaked to other sites.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
