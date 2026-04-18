-- 007: Multi-city / open-jaw trip tracking (e.g., DEL→HKT, BKK→DEL)
-- Stores legs as one-way fares; combined deal = sum of cheapest legs vs rolling baseline.

create table if not exists public.multi_city_trips (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  outbound_dest_code text not null,
  return_origin_code text not null,
  outbound_date date not null,
  return_date date not null,
  origin_codes text[] not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.multi_city_leg_history (
  id uuid primary key default gen_random_uuid(),
  trip_slug text not null references public.multi_city_trips(slug) on delete cascade,
  origin_code text not null,           -- user's home airport (groups the round-trip)
  leg text not null check (leg in ('outbound','return')),
  leg_origin text not null,
  leg_destination text not null,
  departure_date date not null,
  price_inr numeric not null,
  airline text,
  stops integer not null default 0,
  duration_minutes integer,
  source text not null default 'fast-flights',
  fetched_at timestamptz not null default now()
);

create index if not exists idx_mc_leg_history_lookup
  on public.multi_city_leg_history (trip_slug, origin_code, leg, fetched_at desc);

create table if not exists public.multi_city_deals (
  id uuid primary key default gen_random_uuid(),
  trip_slug text not null references public.multi_city_trips(slug) on delete cascade,
  origin_code text not null,
  outbound_price_inr numeric not null,
  return_price_inr numeric not null,
  total_price_inr numeric not null,
  baseline_total_inr numeric not null,
  pct_off integer not null,
  outbound_airline text,
  return_airline text,
  outbound_stops integer not null default 0,
  return_stops integer not null default 0,
  outbound_url text not null,
  return_url text not null,
  deal_type public.deal_type not null default 'common',
  is_active boolean not null default true,
  detected_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists idx_mc_deals_active
  on public.multi_city_deals (is_active, detected_at desc);
create index if not exists idx_mc_deals_trip_origin
  on public.multi_city_deals (trip_slug, origin_code, is_active);

alter table public.multi_city_trips enable row level security;
alter table public.multi_city_leg_history enable row level security;
alter table public.multi_city_deals enable row level security;

create policy "Public read multi_city_trips"
  on public.multi_city_trips for select using (is_active = true);
create policy "Public read multi_city_deals"
  on public.multi_city_deals for select using (is_active = true);
-- leg history is service-role only

-- Seed: Phuket + Bangkok, July 9–16, 2026 from 4 home airports
insert into public.multi_city_trips
  (slug, label, outbound_dest_code, return_origin_code, outbound_date, return_date, origin_codes)
values
  ('phuket-bangkok-jul-2026',
   'Phuket + Bangkok',
   'HKT',
   'BKK',
   '2026-07-09',
   '2026-07-16',
   array['BOM','DEL','IDR','BLR'])
on conflict (slug) do update set
  label = excluded.label,
  outbound_dest_code = excluded.outbound_dest_code,
  return_origin_code = excluded.return_origin_code,
  outbound_date = excluded.outbound_date,
  return_date = excluded.return_date,
  origin_codes = excluded.origin_codes,
  is_active = true;
