import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ServiceWorkerRegistrar } from "@/app/_providers/sw-register";
import { ThemeProvider } from "@/app/_providers/theme-provider";
import { Toaster } from "@/shared/ui/kit/sonner";
import { TooltipProvider } from "@/shared/ui/kit/tooltip";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Wealth Tracker", template: "%s · Wealth Tracker" },
  description: "Track net worth, assets, debts, income and goal plans.",
  applicationName: "Wealth Tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wealth Tracker",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1e1c" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
          <Toaster
            richColors
            closeButton
            position="bottom-right"
            mobileOffset={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom))" }}
          />
        </ThemeProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
