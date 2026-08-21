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
npm run db:seed   # generates the 12-week program + demo history
npm run dev
```

The workspace is linked to its Neon project through `.neon`. Runtime
queries use the pooled `DATABASE_URL`; Prisma migrations use
`DATABASE_URL_UNPOOLED`. Neon-managed values live in the ignored `.env`
file. Deployments must also define `DATABASE_URL`,
`DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL`, and a
private `NEON_AUTH_COOKIE_SECRET` of at least 32 characters.

Open http://localhost:3000.

The seed script always positions "today" in week 7 of 12, with
realistic (deterministic) history for every day before today —
some confirmed, some missed, a few recovered late — so the trail,
pace, streak, and coverage stats are meaningful from the first load.
Today's day starts unconfirmed so you can use the check-in panel for
real.

Re-run `npm run db:seed` any time to reset the program back to that
initial demo state.

## How the data model works

- `Settings` — a single row holding the program's start date (always
  computed relative to today so the "today" marker stays meaningful).
- `Week` (1–12) — a theme/focus string per week.
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
- `npm run db:seed` — reset and reseed the database
- `npm run db:studio` — open Prisma Studio to browse the data
- `npm run build` / `npm run start` — production build

## Design reference

The original visual design (a Claude Design canvas export) is kept
in `design/` for reference.
