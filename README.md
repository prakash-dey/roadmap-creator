# The Ascent — FAANG Prep Tracker

A 12-week interview prep tracker: a "trail" visualization of progress
against calendar pace, daily check-ins, and coverage across DSA, LLD,
HLD, mock interviews and review.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma,
Neon Postgres, and Neon Auth.

## Getting started

```bash
npm install
npx neon env pull
npm run dev
```

The workspace is linked to its Neon project through `.neon`. Runtime
queries use the pooled `DATABASE_URL`; Prisma migrations use
`DATABASE_URL_UNPOOLED`. Neon-managed values live in the ignored `.env`
file. Deployments must also define `DATABASE_URL`,
`DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL`, and a
private `NEON_AUTH_COOKIE_SECRET` of at least 32 characters.

Open http://localhost:3000.

Create an account, then import one or more roadmap files from the
roadmap management screen. Every roadmap is isolated to its owner.

## How the data model works

- `Roadmap` — an owner-scoped program with its title and date range.
- `Week` — a theme/focus string scoped to one roadmap.
- `Day` — one per calendar day of the program, with a `status`
  (`PENDING` / `CONFIRMED` / `MISSED` / `RECOVERED`) and its `Task[]`.
- `Task` — a single study item (category `DSA` / `LLD` / `HLD` /
  `MOCK` / `REVIEW`), toggled done/not-done from the check-in panel.

Closing a day (`confirmDay` in `src/app/actions.ts`) derives its
status from how many tasks ended up done: all done → `CONFIRMED`,
some done → `RECOVERED` (used for both same-day partial confirms and
late check-ins — partial credit counts toward pace but does not
restore the streak), none done → `MISSED`.

## Useful scripts

- `npm run dev` — start the dev server
- `npm run db:studio` — open Prisma Studio to browse the data
- `npm run build` / `npm run start` — production build

## Design reference

The original visual design (a Claude Design canvas export) is kept
in `design/` for reference.
