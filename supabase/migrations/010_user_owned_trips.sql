-- 010: Allow users to own multi-city trips
-- user_email IS NULL  → admin/global trip (visible to all)
-- user_email = X      → personal trip (only visible to that user)

alter table public.multi_city_trips
  add column if not exists user_email text
    references public.user_profiles(email) on delete cascade;

create index if not exists idx_mc_trips_user
  on public.multi_city_trips(user_email)
  where user_email is not null;

-- Replace the public read policy so it shows: global trips + the caller's own trips.
-- (Admin profile fetches use service-role so this RLS only affects future anon reads.)
drop policy if exists "Public read multi_city_trips" on public.multi_city_trips;
create policy "Read global + own multi_city_trips"
  on public.multi_city_trips for select
  using (
    is_active = true
    and (user_email is null or user_email = current_setting('request.jwt.claims', true)::json->>'email')
  );
