-- 008: Per-user price alerts on multi-city trips
-- User picks a trip + their home origin + threshold (max total price OR min %% off).
-- When crawler detects a multi-city deal, matching alerts trigger an email.

create table if not exists public.trip_alerts (
  id uuid primary key default gen_random_uuid(),
  user_email text not null references public.user_profiles(email) on delete cascade,
  trip_slug text not null references public.multi_city_trips(slug) on delete cascade,
  origin_code text not null,
  max_total_inr numeric,             -- notify when total <= this
  min_pct_off integer,               -- notify when pct_off >= this
  is_active boolean not null default true,
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_email, trip_slug, origin_code)
);

create index if not exists idx_trip_alerts_lookup
  on public.trip_alerts (trip_slug, origin_code, is_active);

alter table public.trip_alerts enable row level security;

drop policy if exists "Service role full access to trip_alerts" on public.trip_alerts;
create policy "Service role full access to trip_alerts"
  on public.trip_alerts for all
  using (true)
  with check (true);
