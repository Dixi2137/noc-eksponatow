-- Noc Eksponatów: schemat bazy. Wklej całość w Supabase → SQL Editor → Run.
-- Profil gracza: pseudonim, zapis gry (jsonb), statystyki do rankingu i stan bonusu dziennego.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique check (char_length(nickname) between 3 and 20),
  save jsonb not null default '{}'::jsonb,
  halls_cleared int not null default 0,
  prestige int not null default 0,
  fastest_night numeric,
  night_coins int not null default 0,
  daily_last date,
  daily_streak int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "own profile read" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile read" on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Ranking: tylko publiczne kolumny, bez e-maili i zapisów gry. Widok omija RLS celowo.
create or replace view public.leaderboard as
  select nickname, halls_cleared, prestige, fastest_night, night_coins, updated_at
  from public.profiles
  order by halls_cleared desc, prestige desc, fastest_night asc nulls last
  limit 100;
grant select on public.leaderboard to anon, authenticated;

-- Profil powstaje automatycznie przy rejestracji; pseudonim przychodzi z metadanych konta.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'nickname'), ''), 'gracz-' || left(new.id::text, 8)));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Sprawdzenie pseudonimu przed rejestracją (dostępne bez logowania, zwraca tylko true/false).
create or replace function public.nickname_taken(name text) returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where lower(nickname) = lower(trim(name)));
$$;
grant execute on function public.nickname_taken(text) to anon, authenticated;

-- Bonus dzienny liczony po stronie serwera (data w Europe/Warsaw): 50 pierwszego dnia, +25 za każdy kolejny, maks 300, reset po przerwie.
create or replace function public.claim_daily_bonus() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  p public.profiles%rowtype;
  today date := (now() at time zone 'Europe/Warsaw')::date;
  streak int; bonus int; was_reset boolean;
begin
  select * into p from public.profiles where id = auth.uid();
  if not found then return jsonb_build_object('error', 'no_profile'); end if;
  if p.daily_last = today then return jsonb_build_object('claimed', false, 'bonus', 0, 'streak', p.daily_streak, 'today', today); end if;
  if p.daily_last = today - 1 then streak := p.daily_streak + 1; was_reset := false;
  else streak := 1; was_reset := p.daily_last is not null; end if;
  bonus := least(300, 50 + (streak - 1) * 25);
  update public.profiles set daily_last = today, daily_streak = streak, updated_at = now() where id = auth.uid();
  return jsonb_build_object('claimed', true, 'bonus', bonus, 'streak', streak, 'reset', was_reset, 'today', today);
end $$;
grant execute on function public.claim_daily_bonus() to authenticated;
