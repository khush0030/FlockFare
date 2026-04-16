-- FlockFare hotel deals schema
-- Run in Supabase SQL Editor after 001 + 002

-- Cities we watch for hotel deals (maps to flight destinations)
CREATE TABLE hotel_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  destination_code TEXT REFERENCES destinations(code),  -- link to flight destination
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hotel price snapshots (raw crawl data)
CREATE TABLE hotel_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL REFERENCES hotel_cities(city),
  hotel_name TEXT NOT NULL,
  checkin_date TEXT NOT NULL,         -- 'YYYY-MM-DD'
  nights INTEGER NOT NULL DEFAULT 2,
  price_per_night_inr NUMERIC NOT NULL,
  star_rating INTEGER,                -- 1-5
  source TEXT NOT NULL DEFAULT 'amadeus',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hotel_price_city ON hotel_price_history (city, checkin_date, fetched_at DESC);

-- Hotel deals (detected price drops)
CREATE TABLE hotel_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL REFERENCES hotel_cities(city),
  hotel_name TEXT NOT NULL,
  checkin_date TEXT NOT NULL,
  nights INTEGER NOT NULL DEFAULT 2,
  current_price_inr NUMERIC NOT NULL,
  baseline_price_inr NUMERIC NOT NULL,
  pct_off INTEGER NOT NULL,
  star_rating INTEGER,
  booking_url TEXT NOT NULL,
  deal_type deal_type NOT NULL DEFAULT 'common',
  is_active BOOLEAN NOT NULL DEFAULT true,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_hotel_deals_active ON hotel_deals (is_active, detected_at DESC);

-- RLS
ALTER TABLE hotel_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read hotel_cities" ON hotel_cities FOR SELECT USING (true);
CREATE POLICY "Public read active hotel_deals" ON hotel_deals FOR SELECT USING (is_active = true);

-- Seed hotel cities (matching flight destinations)
INSERT INTO hotel_cities (city, country, destination_code) VALUES
  ('Bangkok', 'Thailand', 'BKK'),
  ('Bali', 'Indonesia', 'DPS'),
  ('Ho Chi Minh City', 'Vietnam', 'SGN'),
  ('Singapore', 'Singapore', 'SIN'),
  ('Kuala Lumpur', 'Malaysia', 'KUL'),
  ('Colombo', 'Sri Lanka', 'CMB'),
  ('Malé', 'Maldives', 'MLE'),
  ('Dubai', 'UAE', 'DXB'),
  ('Istanbul', 'Turkey', 'IST'),
  ('Tokyo', 'Japan', 'NRT'),
  ('Seoul', 'South Korea', 'ICN'),
  ('London', 'United Kingdom', 'LHR'),
  ('Paris', 'France', 'CDG'),
  ('Rome', 'Italy', 'FCO'),
  ('Zurich', 'Switzerland', 'ZRH'),
  ('New York', 'USA', 'JFK'),
  ('San Francisco', 'USA', 'SFO'),
  ('Toronto', 'Canada', 'YYZ'),
  ('Sydney', 'Australia', 'SYD'),
  ('Auckland', 'New Zealand', 'AKL');
