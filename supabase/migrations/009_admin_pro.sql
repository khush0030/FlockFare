-- 008: Pin admin to permanent Pro + reconcile missing onboarded column

-- Reconcile: live DB dropped or never got 006's `onboarded` column
alter table public.user_profiles
  add column if not exists onboarded boolean not null default false;

-- Ensure admin is allowlisted
insert into public.allowed_emails (email)
values ('khushmutha20@gmail.com')
on conflict (email) do nothing;

-- Force Pro + onboarded true for admin (covers already-created profiles)
update public.user_profiles
set plan_tier = 'pro',
    onboarded = true
where email = 'khushmutha20@gmail.com';

-- Upsert profile if admin never signed in (no-op if already exists)
insert into public.user_profiles (email, display_name, plan_tier, onboarded)
values ('khushmutha20@gmail.com', 'Khush', 'pro', true)
on conflict (email) do nothing;
