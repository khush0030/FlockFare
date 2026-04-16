-- Seed origins (home airports)
INSERT INTO origins (code, city, country) VALUES
  ('BOM', 'Mumbai', 'India'),
  ('DEL', 'Delhi', 'India'),
  ('IDR', 'Indore', 'India'),
  ('BLR', 'Bangalore', 'India');

-- Seed destinations (20 international airports)
INSERT INTO destinations (code, city, country, region) VALUES
  -- Southeast Asia
  ('BKK', 'Bangkok', 'Thailand', 'Southeast Asia'),
  ('DPS', 'Bali (Denpasar)', 'Indonesia', 'Southeast Asia'),
  ('SGN', 'Ho Chi Minh City', 'Vietnam', 'Southeast Asia'),
  ('SIN', 'Singapore', 'Singapore', 'Southeast Asia'),
  ('KUL', 'Kuala Lumpur', 'Malaysia', 'Southeast Asia'),
  -- South Asia
  ('CMB', 'Colombo', 'Sri Lanka', 'South Asia'),
  ('MLE', 'Malé', 'Maldives', 'South Asia'),
  -- Middle East
  ('DXB', 'Dubai', 'UAE', 'Middle East'),
  ('IST', 'Istanbul', 'Turkey', 'Middle East'),
  -- East Asia
  ('NRT', 'Tokyo (Narita)', 'Japan', 'East Asia'),
  ('ICN', 'Seoul (Incheon)', 'South Korea', 'East Asia'),
  -- Europe
  ('LHR', 'London', 'United Kingdom', 'Europe'),
  ('CDG', 'Paris', 'France', 'Europe'),
  ('FCO', 'Rome', 'Italy', 'Europe'),
  ('ZRH', 'Zurich', 'Switzerland', 'Europe'),
  -- North America
  ('JFK', 'New York', 'USA', 'North America'),
  ('SFO', 'San Francisco', 'USA', 'North America'),
  ('YYZ', 'Toronto', 'Canada', 'North America'),
  -- Oceania
  ('SYD', 'Sydney', 'Australia', 'Oceania'),
  ('AKL', 'Auckland', 'New Zealand', 'Oceania');
