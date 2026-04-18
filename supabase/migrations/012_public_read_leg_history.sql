-- 012: Allow anon/public read of multi_city_leg_history
-- The /deals page SSR uses the anon client to aggregate trip fares.
-- Leg snapshots are not user-scoped and safe to expose.

drop policy if exists "Public read multi_city_leg_history"
  on public.multi_city_leg_history;

create policy "Public read multi_city_leg_history"
  on public.multi_city_leg_history for select
  using (true);
