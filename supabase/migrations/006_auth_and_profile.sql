-- 006: Auth tables, user profiles, saved deals, bookings, notification prefs
-- Run in Supabase SQL Editor after enabling Google OAuth provider

-- ── Allowed emails (invite-only allowlist) ──
create table if not exists public.allowed_emails (
  email text primary key,
  invited_by uuid references auth.users(id),
  created_at timestamptz default now(),
  used_at timestamptz
);
alter table public.allowed_emails enable row level security;
-- No public access — seed via service role / SQL Editor only

-- ── User profiles ──
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  referral_code text unique,
  referred_by uuid references auth.users(id),
  plan_tier text not null default 'free',
  created_at timestamptz default now()
);
alter table public.user_profiles enable row level security;

create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- ── Saved deals ──
create type public.saved_deal_status as enum ('active', 'booked', 'expired');

create table if not exists public.saved_deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deal_id uuid not null references public.deals(id) on delete cascade,
  status public.saved_deal_status not null default 'active',
  saved_at timestamptz default now(),
  booked_at timestamptz,
  unique(user_id, deal_id)
);
alter table public.saved_deals enable row level security;

create policy "Users manage own saved deals"
  on public.saved_deals for all
  using (auth.uid() = user_id);

-- ── Bookings ──
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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

create policy "Users manage own bookings"
  on public.bookings for all
  using (auth.uid() = user_id);

-- ── Notification preferences ──
create table if not exists public.notification_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  deals_email boolean not null default true,
  weekly_digest boolean not null default true,
  push boolean not null default false,
  updates boolean not null default true,
  analytics boolean not null default true
);
alter table public.notification_prefs enable row level security;

create policy "Users manage own notification prefs"
  on public.notification_prefs for all
  using (auth.uid() = user_id);

-- ── Auto-create profile on signup + enforce allowlist ──
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.allowed_emails where email = new.email) then
    raise exception 'EMAIL_NOT_INVITED';
  end if;

  insert into public.user_profiles (id, display_name, avatar_url, referral_code)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'avatar_url',
    encode(gen_random_bytes(6), 'hex')
  );

  insert into public.notification_prefs (user_id) values (new.id);

  update public.allowed_emails set used_at = now() where email = new.email;

  return new;
end;
$$;

-- Drop if exists to make migration idempotent
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
