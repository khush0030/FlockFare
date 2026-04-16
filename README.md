# FlockFare

**Cheap flights, for your flock.**

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLOCKFARE PIPELINE                          │
│                                                                 │
│  ┌──────────┐   ┌───────────┐   ┌──────────┐   ┌────────────┐  │
│  │  GitHub   │──▶│  Fare     │──▶│  Deal    │──▶│  Notify    │  │
│  │  Actions  │   │  Crawler  │   │  Detector│   │  Fan-out   │  │
│  │  (cron)   │   │  (Python) │   │          │   │            │  │
│  └──────────┘   └───────────┘   └──────────┘   └────────────┘  │
│                      │               │               │          │
│                      ▼               ▼               ▼          │
│               ┌────────────┐  ┌──────────┐   ┌────────────┐    │
│               │ fast-flights│  │ Supabase │   │ Telegram   │    │
│               │ + Amadeus  │  │ Postgres │   │ + Email    │    │
│               │ free tier  │  │          │   │ (Resend)   │    │
│               └────────────┘  └──────────┘   └────────────┘    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Next.js Web App (Vercel)                                 │  │
│  │  Deal feed · Price history charts · Subscribe form        │  │
│  │  Per-destination pages · Google Flights hand-off          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### The Core Loop

1. **Crawl** — Every few hours, fetch lowest fares for 4 origins x 20 destinations x 6 months (480 route combos) via `fast-flights` (Google Flights scraper) + Amadeus API fallback
2. **Compare** — Stack each fare against a 90-day rolling median baseline for that route/month
3. **Detect** — Flag anything 40%+ below baseline as a deal candidate
4. **Filter** — Quality check: max 1 stop, no self-transfers, no transit-visa risk, prefer full-service airlines
5. **Alert** — Push deal cards to Telegram channel + email digest with a one-click Google Flights booking link

### Deal Types

| Type | Threshold | Description |
|------|-----------|-------------|
| **Common** | 40-59% off | Popular routes with solid discounts |
| **Rare** | 60-69% off | Peak-season or obscure destination drops |
| **Unique** | 70%+ off | Mistake fares, pricing errors — live for hours |

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Next.js 15 + Tailwind + shadcn/ui | Free (Vercel Hobby) |
| Database | Supabase (Postgres) | Free tier |
| Crawler | Python (fast-flights + Amadeus) | Free tier |
| Cron | GitHub Actions | Free (2,000 min/mo) |
| Notifications | Telegram Bot + Resend | Free |
| Domain | flockfare.com + flockfare.app | ~$26/yr |

## Watchlist

**Origins:** Mumbai (BOM) · Delhi (DEL) · Indore (IDR) · Bangalore (BLR)

**Destinations (20):**
Southeast Asia: Bangkok · Bali · Ho Chi Minh City · Singapore · Kuala Lumpur
South Asia: Colombo · Maldives
Middle East: Dubai · Istanbul
East Asia: Tokyo · Seoul
Europe: London · Paris · Rome · Zurich
North America: New York · San Francisco · Toronto
Oceania: Sydney · Auckland

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in Supabase URL + keys

# Run database migrations
# Copy SQL from supabase/migrations/ into Supabase SQL Editor

# Start dev server
npm run dev
```

## Project Structure

```
src/
  app/           — Pages + API routes (App Router)
  components/    — React components
  config/        — Watchlist, thresholds
  lib/           — Supabase clients, URL builders
  types/         — TypeScript types
supabase/
  migrations/    — SQL schema + seed data
docs/            — Planning docs & analysis
```
