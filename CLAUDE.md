# FlockFare

Zomunk-style flight & hotel deal alerter for friends & family. Near-zero cost.

## Stack

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS + shadcn/ui
- **Database**: Supabase (Postgres) — hosted at ksamfulzyizsskdzualf.supabase.co
- **Crawler**: Python (fast-flights + Amadeus free tier) — runs via GitHub Actions cron
- **Notifications**: Telegram bot + Resend email
- **Hosting**: Vercel (hobby tier)

## Project Structure

```
src/
  app/           — Next.js App Router pages + API routes
  components/    — React components (ui/ for shadcn)
  config/        — Watchlist, thresholds, constants
  lib/           — Supabase clients, URL builders, utilities
  types/         — TypeScript types (database.ts)
supabase/
  migrations/    — SQL migrations (run in Supabase SQL Editor)
docs/            — Planning docs, analysis
```

## Key Conventions

- Use `@/` import alias for `src/`
- Supabase anon client for reads, service role for writes (crawler/detector)
- Deal threshold: 40%+ drop from 90-day rolling median baseline
- Travel months in 'YYYY-MM' format
- Airport codes are IATA 3-letter codes
- All prices stored in INR

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint
```

## Database Migrations

Run SQL files from `supabase/migrations/` in order in the Supabase SQL Editor.
