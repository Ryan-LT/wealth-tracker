"use client";

import { CreditCard, Download, Landmark, LogOut, RefreshCw, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { useSignOut } from "@/features/sign-out";
import { useSyncNow } from "@/features/sync-now";
import { formatRelative, formatTime } from "@/shared/lib/format";
import { useLastSyncedAt } from "@/shared/storage";
import { Callout } from "@/shared/ui/callout";
import { DescriptionList } from "@/shared/ui/description-list";
import { Button } from "@/shared/ui/kit/button";
import { PageHeader } from "@/shared/ui/page-header";
import { Section } from "@/shared/ui/section";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { StatusBadge } from "@/shared/ui/status-badge";
import { PageContainer, useOnline, useShell } from "@/widgets/app-shell";

import { downloadBackup } from "../lib/export-backup";

const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

type ThemeValue = (typeof THEMES)[number]["value"];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { userName, authEnabled } = useShell();
  const online = useOnline();
  const lastSyncedAt = useLastSyncedAt();
  const { syncNow, syncing } = useSyncNow();
  const { signOut, pending } = useSignOut();

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Settings" description="Appearance, data sync and your session." />

      <Section title="Appearance" description="Choose how Wealth Tracker looks on this device.">
        <SegmentedControl<ThemeValue>
          aria-label="Theme"
          value={(theme as ThemeValue) ?? "system"}
          onValueChange={setTheme}
          options={[...THEMES]}
        />
      </Section>

      <Section
        title="Data & sync"
        description="Your data lives in your Neon database and is cached on this device so the app works offline."
        actions={
          <Button variant="outline" size="sm" onClick={() => void syncNow()} disabled={syncing || !online}>
            <RefreshCw className={syncing ? "animate-spin" : undefined} />
            Sync now
          </Button>
        }
      >
        <DescriptionList
          items={[
            {
              label: "Connection",
              value: online ? <StatusBadge tone="success" dot>Online</StatusBadge> : <StatusBadge tone="warning" dot>Offline</StatusBadge>,
            },
            {
              label: "Last synced",
              value: lastSyncedAt ? (
                <span title={new Date(lastSyncedAt).toLocaleString()}>
                  {formatRelative(lastSyncedAt)} · {formatTime(lastSyncedAt)}
                </span>
              ) : (
                "Not yet"
              ),
            },
            {
              label: "Backup",
              hint: "Downloads every table as JSON (same shape as the API).",
              value: (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    downloadBackup();
                    toast.success("Backup downloaded");
                  }}
                >
                  <Download />
                  Export JSON
                </Button>
              ),
            },
          ]}
        />
      </Section>

      <Section title="Session">
        <DescriptionList
          items={[
            { label: "Signed in as", value: userName },
            {
              label: "Login",
              value: authEnabled ? <StatusBadge tone="success" dot>Enabled</StatusBadge> : <StatusBadge dot>Disabled</StatusBadge>,
              hint: authEnabled ? undefined : "Set AUTH_USERNAME, AUTH_PASSWORD and AUTH_SECRET on the server to require a login.",
            },
          ]}
        />
        {authEnabled ? (
          <Button variant="outline" className="mt-4" onClick={() => void signOut()} disabled={pending}>
            <LogOut />
            Sign out
          </Button>
        ) : null}
      </Section>

      <Callout tone="info" title="Looking for asset, income or debt settings?">
        They now have their own pages:{" "}
        <Link className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline" href="/assets">
          <Landmark className="size-3.5" /> Assets
        </Link>
        ,{" "}
        <Link className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline" href="/income">
          <TrendingUp className="size-3.5" /> Income &amp; spending
        </Link>{" "}
        and{" "}
        <Link className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline" href="/debts">
          <CreditCard className="size-3.5" /> Debts
        </Link>
        .
      </Callout>
    </PageContainer>
  );
}
