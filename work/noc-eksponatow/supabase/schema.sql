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

-- ── Moderacja (2026-10-21) ──────────────────────────────────────────────────────────────────
-- Role: player (domyślnie), moderator, admin. Rolę nadaje się ręcznie w SQL Editorze (service role, bez JWT):
--   update public.profiles set role = 'admin' where nickname = 'TwojPseudonim';
alter table public.profiles add column if not exists role text not null default 'player';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('player', 'moderator', 'admin'));
alter table public.profiles add column if not exists banned_until timestamptz;
alter table public.profiles add column if not exists ban_reason text;
alter table public.profiles add column if not exists mod_note text;

create or replace function public.is_mod() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin'));
$$;
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
grant execute on function public.is_mod() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- Gracz nie zmieni sam roli, bana ani notatki: trigger przywraca stare wartości. Rolę zmienia tylko admin
-- (albo SQL Editor bez JWT, gdzie auth.uid() jest puste).
create or replace function public.protect_mod_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if not public.is_mod() then
    new.role := old.role; new.banned_until := old.banned_until; new.ban_reason := old.ban_reason; new.mod_note := old.mod_note;
  elsif new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;
drop trigger if exists protect_mod_fields on public.profiles;
create trigger protect_mod_fields before update on public.profiles for each row execute procedure public.protect_mod_fields();

-- Moderator widzi wszystkie profile; zbanowany gracz nie zapisze nic w chmurze.
drop policy if exists "mods read all" on public.profiles;
create policy "mods read all" on public.profiles for select using (public.is_mod());
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update
  using (auth.uid() = id and (banned_until is null or banned_until < now()))
  with check (auth.uid() = id);

-- Statystyki dla panelu moderatora.
create or replace function public.mod_stats() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  return jsonb_build_object(
    'players', (select count(*) from public.profiles),
    'active_today', (select count(*) from public.profiles where updated_at > now() - interval '1 day'),
    'banned', (select count(*) from public.profiles where banned_until > now()),
    'halls', (select coalesce(sum(halls_cleared), 0) from public.profiles),
    'mods', (select count(*) from public.profiles where role <> 'player'));
end $$;

-- Lista graczy (szukanie po pseudonimie), z żetonami i saldem wyciągniętymi z zapisu gry.
create or replace function public.mod_list(q text default '', lim int default 50)
returns table (id uuid, nickname text, role text, halls_cleared int, prestige int, night_coins int, coins int, balance int,
               banned_until timestamptz, ban_reason text, mod_note text, updated_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  return query
    select p.id, p.nickname, p.role, p.halls_cleared, p.prestige, p.night_coins,
           coalesce((p.save->>'coins')::numeric, 0)::int, coalesce((p.save->>'balance')::numeric, 0)::int,
           p.banned_until, p.ban_reason, p.mod_note, p.updated_at
    from public.profiles p
    where coalesce(q, '') = '' or p.nickname ilike '%' || q || '%'
    order by p.updated_at desc
    limit least(greatest(lim, 1), 200);
end $$;

-- Ban na podaną liczbę godzin (0 lub mniej = bezterminowo), odbanowanie, notatka.
create or replace function public.mod_ban(target uuid, hours int, reason text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  if target = auth.uid() then raise exception 'self_ban'; end if;
  if exists (select 1 from public.profiles where id = target and role = 'admin') and not public.is_admin() then raise exception 'cannot_ban_admin'; end if;
  update public.profiles set banned_until = case when hours > 0 then now() + make_interval(hours => hours) else now() + interval '100 years' end,
    ban_reason = nullif(trim(reason), ''), updated_at = now() where id = target;
  return jsonb_build_object('ok', found);
end $$;
create or replace function public.mod_unban(target uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  update public.profiles set banned_until = null, ban_reason = null, updated_at = now() where id = target;
  return jsonb_build_object('ok', found);
end $$;
create or replace function public.mod_note(target uuid, note text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  update public.profiles set mod_note = nullif(trim(note), ''), updated_at = now() where id = target;
  return jsonb_build_object('ok', found);
end $$;

-- Korekta żetonów i salda (w groszach) w zapisie gry; nigdy poniżej zera.
create or replace function public.mod_adjust(target uuid, coins_delta int default 0, balance_delta int default 0) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s jsonb; c numeric; b numeric;
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  select save into s from public.profiles where id = target;
  if s is null then return jsonb_build_object('ok', false); end if;
  c := greatest(0, coalesce((s->>'coins')::numeric, 0) + coins_delta);
  b := greatest(0, coalesce((s->>'balance')::numeric, 0) + balance_delta);
  s := jsonb_set(jsonb_set(s, '{coins}', to_jsonb(c::int), true), '{balance}', to_jsonb(b::int), true);
  update public.profiles set save = s, updated_at = now() where id = target;
  return jsonb_build_object('ok', true, 'coins', c::int, 'balance', b::int);
end $$;

-- Reset zapisu gracza (zostaje pseudonim i konto).
create or replace function public.mod_reset(target uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  update public.profiles set save = '{}'::jsonb, halls_cleared = 0, prestige = 0, fastest_night = null, night_coins = 0, updated_at = now() where id = target;
  return jsonb_build_object('ok', found);
end $$;

-- Zmiana roli: tylko admin, i nie sobie samemu (żeby nie odciąć sobie dostępu przez pomyłkę).
create or replace function public.mod_set_role(target uuid, new_role text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if target = auth.uid() then raise exception 'self_role'; end if;
  update public.profiles set role = new_role, updated_at = now() where id = target;
  return jsonb_build_object('ok', found);
end $$;
grant execute on function public.mod_stats() to authenticated;
grant execute on function public.mod_list(text, int) to authenticated;
grant execute on function public.mod_ban(uuid, int, text) to authenticated;
grant execute on function public.mod_unban(uuid) to authenticated;
grant execute on function public.mod_note(uuid, text) to authenticated;
grant execute on function public.mod_adjust(uuid, int, int) to authenticated;
grant execute on function public.mod_reset(uuid) to authenticated;
grant execute on function public.mod_set_role(uuid, text) to authenticated;
