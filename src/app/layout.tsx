import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { MuiAppProvider } from "./MuiAppProvider";
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
      <body className="bg-background text-on-background min-h-screen">
        <MuiAppProvider>
          <AppShell>{children}</AppShell>
        </MuiAppProvider>
      </body>
    </html>
  );
}
