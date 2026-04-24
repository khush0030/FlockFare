-- 013_home_airport.sql
-- Add home_airport (IATA 3-letter) to user_profiles; default IDR.

alter table user_profiles
  add column if not exists home_airport text not null default 'IDR'
    check (char_length(home_airport) = 3);

update user_profiles
  set home_airport = 'IDR'
  where home_airport is null;
