<img src="brand/logo/cairn-logo.svg" alt="Cairn" height="44">

# Cairn

*Build wealth, stone by stone.* Cairn (formerly Wealth Tracker) is a private personal finance console with separate accounts: net worth, assets, income and
spending, debts, informal loans, goal plans with projections, and how your assets
are committed across plans. Works offline as an installable PWA.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn/Radix ·
TanStack Table · Recharts · react-hook-form + zod · Serwist · Neon Postgres.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in DATABASE_URL and AUTH_SECRET
psql "$DATABASE_URL" -f db/schema.sql   # once per database, then add an account (below)
pnpm dev
```

Open http://localhost:3000.

Brand guide, logo files and colours: [`brand/BRAND.md`](brand/BRAND.md).

For local UI work without touching your real data, create `.env.development.local`
(gitignored, overrides `.env.local` in dev only):

```bash
DATABASE_URL=        # empty: no database, no login gate; the app runs from the browser cache
```

Point `DATABASE_URL` at a Neon **dev branch** to exercise real round trips.

## Accounts

Each account has its own data; a new account starts empty. There is no sign-up
page: accounts are created in SQL (Neon SQL Editor). Copy
[`db/create-user.sql`](db/create-user.sql), fill in the username, display name
and password, and run it:

```sql
INSERT INTO wealthtracker_users (username, display_name, password_hash)
VALUES (lower('alice'), 'Alice Nguyen', crypt('a-strong-password', gen_salt('bf', 12)));
```

Passwords are bcrypt hashes (`pgcrypto`). Login needs `DATABASE_URL` and
`AUTH_SECRET`; the session lasts 30 days.

- **Sign in** with the username, or the email once one is set for the account.
- **Change password:** each person does it in Settings → Password (current password
  required). It signs them out on their other devices.
- **Forgot password:** an admin resets it in SQL, then the person changes it in Settings.
- **Lockout:** 5 wrong passwords in a row lock the account for 15 minutes.

[`db/create-user.sql`](db/create-user.sql) has the snippets for setting an email,
an admin password reset, unlocking an account and deleting one with its data.

**Database upgrades** live in [`db/migrations/`](db/migrations/); run each one in
the Neon SQL Editor before deploying the code that needs it.

**Upgrading from the single-login version:** sync every device, run
[`db/migrations/2026-10-multi-user.sql`](db/migrations/2026-10-multi-user.sql) with
your username and password filled in (your existing data becomes yours), deploy,
then remove `AUTH_USERNAME`, `AUTH_PASSWORD`, `USER_DATE_OF_BIRTH` and
`WEALTH_MILESTONE_TARGET_USD` from the environment. Your birth date and milestone
target now live in Settings → Milestone goal.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build (webpack — required by Serwist) |
| `pnpm lint` | ESLint, including design-system guardrails |
| `pnpm typecheck` | TypeScript |
| `pnpm test` | Vitest (finance logic, formatters, store) |

Keep `pnpm-lock.yaml` and `package-lock.json` in sync: `pnpm add …` then
`npm install --package-lock-only`.

## Structure (Feature-Sliced Design)

```
src/
  app/        routes, layouts, PWA (manifest, service worker), API routes
  views/      one folder per page (dashboard, goals, allocations, assets, income, debts, loans, settings)
  widgets/    app-shell: sidebar, top bar, mobile tab bar, command palette, hydration gate
  features/   allocate-sources dialog, sign-out, sync-now
  entities/   domain models + pure, tested logic (goal, portfolio, milestone, asset, debt, …)
  shared/     api, config (nav), lib (format, dates), storage (client store), ui (design system)
```

### Data

All data lives in one Neon table (`wealthtracker_kv`) as JSON documents per user and key
(`assets`, `settingsAssets`, `incomeSources`, `debts`, `goals`, `preferences`,
`personalLoans`), read and written through `GET/PUT /api/tables`, which only ever see
the signed-in user's rows. The client store (`src/shared/storage/store.ts`) caches
everything in `localStorage` (one cache per account), saves edits after a short
debounce and retries with backoff when offline. Signing out removes the account's
cached data from the device once it has synced.

### Design system

- Tokens in `src/app/globals.css` — the "Warm stone" palette: warm off-white / charcoal
  neutrals (a dimmed, low-glare dark mode), one soft indigo accent with a `primary-soft`
  tint for selected states, `success / warning / danger / info` for signed values and
  status (all AA in both modes), and a chart palette validated against the card surface.
- Components in `src/shared/ui` (`PageHeader`, `Section`, `StatCard`, `Money`,
  `StatusBadge`, `DataTable`, form fields…), primitives in `src/shared/ui/kit`.
- Money is always written `1.245.670.000 ₫` (compact `4,82B ₫` on KPI tiles, full value
  on hover/tap); dates as `12 Mar 2026`.
- ESLint rejects arbitrary font sizes and raw palette colours.
