import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AppShell } from "@/widgets/app-shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WealthTracker — Private Terminal",
  description:
    "WealthTracker — a private financial terminal for tracking net worth, assets, debts, income, and goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        {/* Material Symbols Outlined is the icon font used across the design.
            next/font/google does not currently recognize it, so we load the
            variable-axis stylesheet directly. The lint rule below targets
            page-level custom fonts; this is a root-layout app-wide font. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-background text-on-background min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
