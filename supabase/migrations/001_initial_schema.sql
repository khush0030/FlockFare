-- FlockFare initial schema
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > New Query

-- Enums
CREATE TYPE deal_type AS ENUM ('common', 'rare', 'unique');
CREATE TYPE cabin_class AS ENUM ('economy', 'premium_economy', 'business', 'first');

-- Origins (home airports)
CREATE TABLE origins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,        -- IATA code e.g. BOM
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Destinations (watched international airports)
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,        -- IATA code e.g. BKK
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,              -- e.g. 'Southeast Asia', 'Europe'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Price history (raw crawl data — one row per fetch)
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_code TEXT NOT NULL REFERENCES origins(code),
  destination_code TEXT NOT NULL REFERENCES destinations(code),
  travel_month TEXT NOT NULL,       -- 'YYYY-MM' format
  price_inr NUMERIC NOT NULL,
  airline TEXT,
  stops INTEGER NOT NULL DEFAULT 0,
  cabin_class cabin_class NOT NULL DEFAULT 'economy',
  duration_minutes INTEGER,
  source TEXT NOT NULL DEFAULT 'fast-flights',  -- 'fast-flights', 'amadeus', etc.
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for baseline calculation (rolling median per route/month)
CREATE INDEX idx_price_history_route_month
  ON price_history (origin_code, destination_code, travel_month, fetched_at DESC);

-- Deals (detected price drops that pass quality filter)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_code TEXT NOT NULL REFERENCES origins(code),
  destination_code TEXT NOT NULL REFERENCES destinations(code),
  travel_month TEXT NOT NULL,
  current_price_inr NUMERIC NOT NULL,
  baseline_price_inr NUMERIC NOT NULL,
  pct_off INTEGER NOT NULL,         -- e.g. 45 for 45% off
  airline TEXT,
  stops INTEGER NOT NULL DEFAULT 0,
  cabin_class cabin_class NOT NULL DEFAULT 'economy',
  duration_minutes INTEGER,
  bags_included BOOLEAN NOT NULL DEFAULT true,
  deal_type deal_type NOT NULL DEFAULT 'common',
  google_flights_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_deals_active ON deals (is_active, detected_at DESC);
CREATE INDEX idx_deals_route ON deals (origin_code, destination_code);

-- Subscribers (friends & family)
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  telegram_chat_id TEXT UNIQUE,
  home_airport TEXT NOT NULL DEFAULT 'BOM' REFERENCES origins(code),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE origins ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Public read access for origins, destinations, and active deals
CREATE POLICY "Public read origins" ON origins FOR SELECT USING (true);
CREATE POLICY "Public read destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Public read active deals" ON deals FOR SELECT USING (is_active = true);

-- Service role only for writes (crawler, detector)
-- anon key can only read; service_role key can do everything
