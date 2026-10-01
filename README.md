# Wealth Tracker

A private, single-user personal finance console: net worth, assets, income and
spending, debts, informal loans, goal plans with projections, and how your assets
are committed across plans. Works offline as an installable PWA.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn/Radix ·
TanStack Table · Recharts · react-hook-form + zod · Serwist · Neon Postgres.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in DATABASE_URL and AUTH_* values
pnpm dev
```

Open http://localhost:3000.

For local UI work without touching your real data, create `.env.development.local`
(gitignored, overrides `.env.local` in dev only):

```bash
DATABASE_URL=        # empty: no database; the app runs from the browser cache
AUTH_USERNAME=       # empty: login gate disabled
```

Point `DATABASE_URL` at a Neon **dev branch** to exercise real round trips.

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

All data lives in one Neon table (`wealthtracker_kv`) as JSON documents per key
(`assets`, `settingsAssets`, `incomeSources`, `debts`, `goals`, `preferences`,
`personalLoans`), read and written through `GET/PUT /api/tables`. The client store
(`src/shared/storage/store.ts`) caches everything in `localStorage`, saves edits after
a short debounce and retries with backoff when offline.

### Design system

- Tokens in `src/app/globals.css` (one indigo accent; `success / warning / danger / info`
  for signed values and status; validated chart palette).
- Components in `src/shared/ui` (`PageHeader`, `Section`, `StatCard`, `Money`,
  `StatusBadge`, `DataTable`, form fields…), primitives in `src/shared/ui/kit`.
- Money is always written `1.245.670.000 ₫` (compact `4,82B ₫` on KPI tiles, full value
  on hover/tap); dates as `12 Mar 2026`.
- ESLint rejects arbitrary font sizes and raw palette colours.
