"use client";

import { CreditCard, Download, Landmark, LogOut, RefreshCw, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { PREFERENCES_SEED } from "@/entities/preferences";
import { useSignOut } from "@/features/sign-out";
import { useSyncNow } from "@/features/sync-now";
import { BRAND } from "@/shared/config";
import { formatRelative, formatTime } from "@/shared/lib/format";
import { useLastSyncedAt, useTable } from "@/shared/storage";
import { Callout } from "@/shared/ui/callout";
import { DescriptionList } from "@/shared/ui/description-list";
import { Button } from "@/shared/ui/kit/button";
import { PageHeader } from "@/shared/ui/page-header";
import { Section } from "@/shared/ui/section";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { StatusBadge } from "@/shared/ui/status-badge";
import { PageContainer, useOnline, useShell } from "@/widgets/app-shell";

import { downloadBackup } from "../lib/export-backup";
import { ChangePasswordForm } from "./change-password-form";
import { MilestoneForm } from "./milestone-form";

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
  const [prefs, setPrefs] = useTable("preferences", PREFERENCES_SEED);

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Settings" description="Your milestone goal, appearance, data sync, password and session." />

      <div id="milestone" className="scroll-mt-20">
        <Section
          title="Milestone goal"
          description="The net worth you want to reach and by what age. Shown on the dashboard; the deadline is your birthday at that age."
        >
          <MilestoneForm
            value={prefs.milestone}
            onSave={(milestone) => {
              setPrefs((p) => ({ ...p, milestone }));
              toast.success("Milestone goal saved");
            }}
          />
        </Section>
      </div>

      <Section title="Appearance" description={`Choose how ${BRAND.name} looks on this device.`}>
        <SegmentedControl<ThemeValue>
          aria-label="Theme"
          value={(theme as ThemeValue) ?? "system"}
          onValueChange={setTheme}
          options={[...THEMES]}
        />
      </Section>

      <Section
        title="Data & sync"
        description="Your data is private to your account. It is saved to the server and cached on this device so the app works offline."
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

      {authEnabled ? (
        <Section
          title="Password"
          description="Changing it signs you out on your other devices. Forgot it? Ask the app admin to reset it."
        >
          <ChangePasswordForm />
        </Section>
      ) : null}

      <Section title="Session">
        <DescriptionList
          items={[
            { label: "Signed in as", value: userName },
            {
              label: "Login",
              value: authEnabled ? <StatusBadge tone="success" dot>Enabled</StatusBadge> : <StatusBadge dot>Disabled</StatusBadge>,
              hint: authEnabled ? undefined : "Set DATABASE_URL and AUTH_SECRET on the server and add accounts with db/create-user.sql.",
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
