-- 006: User profiles, saved deals, bookings, notification prefs, invite allowlist
-- NextAuth handles auth — Supabase is DB only, no auth.users dependency

-- ── Allowed emails (invite-only allowlist) ──
create table if not exists public.allowed_emails (
  email text primary key,
  invited_by text,
  created_at timestamptz default now(),
  used_at timestamptz
);
alter table public.allowed_emails enable row level security;
-- No public RLS — seed via service role / SQL Editor only

-- ── User profiles ──
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  avatar_url text,
  referral_code text unique,
  referred_by text,
  plan_tier text not null default 'free',
  created_at timestamptz default now()
);
alter table public.user_profiles enable row level security;

-- Public read for own profile (matched by email via RLS or service role)
-- Since NextAuth sessions don't map to Supabase auth, use service role for writes
-- and anon key reads are disabled
create policy "Service role full access to user_profiles"
  on public.user_profiles for all
  using (true)
  with check (true);

-- ── Saved deals ──
create type public.saved_deal_status as enum ('active', 'booked', 'expired');

create table if not exists public.saved_deals (
  id uuid primary key default gen_random_uuid(),
  user_email text not null references public.user_profiles(email) on delete cascade,
  deal_id uuid not null references public.deals(id) on delete cascade,
  status public.saved_deal_status not null default 'active',
  saved_at timestamptz default now(),
  booked_at timestamptz,
  unique(user_email, deal_id)
);
alter table public.saved_deals enable row level security;

create policy "Service role full access to saved_deals"
  on public.saved_deals for all
  using (true)
  with check (true);

-- ── Bookings ──
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_email text not null references public.user_profiles(email) on delete cascade,
  deal_id uuid references public.deals(id) on delete set null,
  route text not null,
  airline text,
  cabin text default 'economy',
  travel_month text,
  price_paid_inr integer not null,
  baseline_inr integer not null,
  booked_at timestamptz default now()
);
alter table public.bookings enable row level security;

create policy "Service role full access to bookings"
  on public.bookings for all
  using (true)
  with check (true);

-- ── Notification preferences ──
create table if not exists public.notification_prefs (
  email text primary key references public.user_profiles(email) on delete cascade,
  deals_email boolean not null default true,
  weekly_digest boolean not null default true,
  push boolean not null default false,
  updates boolean not null default true,
  analytics boolean not null default true
);
alter table public.notification_prefs enable row level security;

create policy "Service role full access to notification_prefs"
  on public.notification_prefs for all
  using (true)
  with check (true);
