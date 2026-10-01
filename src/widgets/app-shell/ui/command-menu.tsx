"use client";

import {
  CreditCard,
  HandCoins,
  Landmark,
  LogOut,
  Monitor,
  Moon,
  Plus,
  RefreshCw,
  Sun,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, type ReactNode } from "react";

import { useSignOut } from "@/features/sign-out";
import { useSyncNow } from "@/features/sync-now";
import { DEBTS_SEED } from "@/entities/debt";
import { GOALS_SEED } from "@/entities/goal";
import { INCOME_SOURCES_SEED } from "@/entities/income";
import { PERSONAL_LOANS_SEED, type PersonalLoan } from "@/entities/personal-loan";
import { SETTINGS_ASSETS_SEED } from "@/entities/settings-asset";
import { NAV } from "@/shared/config";
import { formatMoneyCompact } from "@/shared/lib/format";
import { useTable } from "@/shared/storage";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/shared/ui/kit/command";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/kit/dialog";

import { useShell } from "../model/shell-context";

const QUICK_ACTIONS: { label: string; href: string; icon: LucideIcon; keywords: string }[] = [
  { label: "Add asset", href: "/assets?new=1", icon: Landmark, keywords: "create new asset" },
  { label: "Add income source", href: "/income?new=1", icon: TrendingUp, keywords: "create new income salary" },
  { label: "Add debt", href: "/debts?new=1", icon: CreditCard, keywords: "create new debt loan liability" },
  { label: "Add personal loan", href: "/loans?new=1", icon: HandCoins, keywords: "create new lend borrow" },
  { label: "New goal plan", href: "/goals?new=1", icon: Target, keywords: "create new goal plan" },
];

function Item({
  value,
  icon: Icon,
  onSelect,
  children,
  meta,
}: {
  value: string;
  icon: LucideIcon;
  onSelect: () => void;
  children: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <CommandItem value={value} onSelect={onSelect}>
      <Icon />
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {meta ? <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{meta}</span> : null}
    </CommandItem>
  );
}

/** ⌘K / Ctrl+K palette: navigate, quick-add, jump to records, and app actions. */
export function CommandMenu() {
  const { commandOpen: open, setCommandOpen: setOpen, authEnabled } = useShell();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { syncNow } = useSyncNow();
  const { signOut } = useSignOut();

  const [assets] = useTable("settingsAssets", SETTINGS_ASSETS_SEED);
  const [sources] = useTable("incomeSources", INCOME_SOURCES_SEED);
  const [debts] = useTable("debts", DEBTS_SEED);
  const [loans] = useTable<PersonalLoan[]>("personalLoans", PERSONAL_LOANS_SEED);
  const [goals, setGoals] = useTable("goals", GOALS_SEED);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };
  const go = (href: string) => run(() => router.push(href));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="lg" showCloseButton={false} className="sm:top-[12%] sm:translate-y-0">
        <DialogTitle className="sr-only">Search and commands</DialogTitle>
        <DialogDescription className="sr-only">Jump to a page or record, or run an action.</DialogDescription>
        <Command className="max-sm:pb-[env(safe-area-inset-bottom)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-item]]:py-2">
          <CommandInput placeholder="Search pages, records and actions…" />
          <CommandList className="max-h-[min(60vh,28rem)]">
            <CommandEmpty>No results.</CommandEmpty>

            <CommandGroup heading="Go to">
              {NAV.map((item) => (
                <Item key={item.href} value={`go ${item.label} ${item.description}`} icon={item.icon} onSelect={() => go(item.href)}>
                  {item.label}
                </Item>
              ))}
            </CommandGroup>

            <CommandGroup heading="Quick actions">
              {QUICK_ACTIONS.map((a) => (
                <Item key={a.href} value={`${a.label} ${a.keywords}`} icon={Plus} onSelect={() => go(a.href)}>
                  {a.label}
                </Item>
              ))}
            </CommandGroup>

            {goals.profiles.length ? (
              <CommandGroup heading="Goal plans">
                {goals.profiles.map((p) => (
                  <Item
                    key={p.id}
                    value={`plan goal ${p.name} ${p.id}`}
                    icon={Target}
                    meta={formatMoneyCompact(p.targetAmount)}
                    onSelect={() =>
                      run(() => {
                        setGoals((g) => ({ ...g, activeProfileId: p.id }));
                        router.push("/goals");
                      })
                    }
                  >
                    {p.name.trim() || "Untitled plan"}
                  </Item>
                ))}
              </CommandGroup>
            ) : null}

            {assets.length ? (
              <CommandGroup heading="Assets">
                {assets.map((a) => (
                  <Item
                    key={a.id}
                    value={`asset ${a.name} ${a.category} ${a.id}`}
                    icon={Landmark}
                    meta={formatMoneyCompact(a.currentValue)}
                    onSelect={() => go(`/assets?edit=${encodeURIComponent(a.id)}`)}
                  >
                    {a.name}
                  </Item>
                ))}
              </CommandGroup>
            ) : null}

            {sources.length ? (
              <CommandGroup heading="Income sources">
                {sources.map((s) => (
                  <Item
                    key={s.id}
                    value={`income ${s.name} ${s.details} ${s.id}`}
                    icon={TrendingUp}
                    meta={`${formatMoneyCompact(s.monthly)}/mo`}
                    onSelect={() => go(`/income?edit=${encodeURIComponent(s.id)}`)}
                  >
                    {s.name}
                  </Item>
                ))}
              </CommandGroup>
            ) : null}

            {debts.length ? (
              <CommandGroup heading="Debts">
                {debts.map((d) => (
                  <Item
                    key={d.id}
                    value={`debt ${d.name} ${d.id}`}
                    icon={CreditCard}
                    meta={formatMoneyCompact(d.balance)}
                    onSelect={() => go(`/debts?edit=${encodeURIComponent(d.id)}`)}
                  >
                    {d.name}
                  </Item>
                ))}
              </CommandGroup>
            ) : null}

            {loans.length ? (
              <CommandGroup heading="Personal loans">
                {loans.map((l) => (
                  <Item
                    key={l.id}
                    value={`loan ${l.person} ${l.note ?? ""} ${l.id}`}
                    icon={HandCoins}
                    meta={`${l.direction === "lent_out" ? "owed to you" : "you owe"} · ${formatMoneyCompact(l.amount)}`}
                    onSelect={() => go(`/loans?edit=${encodeURIComponent(l.id)}`)}
                  >
                    {l.person}
                  </Item>
                ))}
              </CommandGroup>
            ) : null}

            <CommandSeparator />
            <CommandGroup heading="Preferences">
              <Item value="theme light" icon={Sun} onSelect={() => run(() => setTheme("light"))}>
                Light theme
              </Item>
              <Item value="theme dark" icon={Moon} onSelect={() => run(() => setTheme("dark"))}>
                Dark theme
              </Item>
              <Item value="theme system" icon={Monitor} onSelect={() => run(() => setTheme("system"))}>
                System theme
              </Item>
              <Item value="sync now refresh" icon={RefreshCw} onSelect={() => run(() => void syncNow())}>
                Sync now
              </Item>
              {authEnabled ? (
                <Item value="sign out log out" icon={LogOut} onSelect={() => run(() => void signOut())}>
                  Sign out
                </Item>
              ) : null}
            </CommandGroup>
          </CommandList>
          <div className="hidden items-center justify-end gap-3 border-t px-3 py-2 text-xs text-muted-foreground sm:flex">
            <span>
              Navigate <CommandShortcut className="ml-1">↑↓</CommandShortcut>
            </span>
            <span>
              Open <CommandShortcut className="ml-1">↵</CommandShortcut>
            </span>
            <span>
              Toggle <CommandShortcut className="ml-1">⌘K</CommandShortcut>
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
