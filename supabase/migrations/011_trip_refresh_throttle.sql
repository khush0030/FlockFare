-- 011: Per-trip "refresh now" throttle column
-- Tracks last manual refresh to enforce 1-per-hour-per-trip limit.

alter table public.multi_city_trips
  add column if not exists last_manual_refresh_at timestamptz;
