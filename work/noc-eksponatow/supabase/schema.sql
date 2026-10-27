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

-- ── Rangi honorowe (2026-10-21) ─────────────────────────────────────────────────────────────
-- Tytuł nadawany ręcznie przez moderatora, widoczny w rankingu i w koncie. „First to arrive” może mieć tylko jedna osoba.
alter table public.profiles add column if not exists title text;
alter table public.profiles drop constraint if exists profiles_title_check;
alter table public.profiles add constraint profiles_title_check check (title is null or title in ('owner', 'first-to-arrive', 'founder', 'veteran', 'patron', 'demon-slayer'));
create unique index if not exists profiles_first_to_arrive on public.profiles (title) where title = 'first-to-arrive';

create or replace function public.protect_mod_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if not public.is_mod() then
    new.role := old.role; new.banned_until := old.banned_until; new.ban_reason := old.ban_reason; new.mod_note := old.mod_note; new.title := old.title;
  elsif new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;

create or replace function public.mod_set_title(target uuid, new_title text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  if new_title = 'first-to-arrive' and exists (select 1 from public.profiles where title = 'first-to-arrive' and id <> target) then raise exception 'title_taken'; end if;
  update public.profiles set title = nullif(trim(new_title), ''), updated_at = now() where id = target;
  return jsonb_build_object('ok', found);
end $$;
grant execute on function public.mod_set_title(uuid, text) to authenticated;

-- Ranking i lista moderatora niosą rangę.
create or replace view public.leaderboard as
  select nickname, halls_cleared, prestige, fastest_night, night_coins, updated_at, title
  from public.profiles
  order by halls_cleared desc, prestige desc, fastest_night asc nulls last
  limit 100;
grant select on public.leaderboard to anon, authenticated;

drop function if exists public.mod_list(text, int);
create or replace function public.mod_list(q text default '', lim int default 50)
returns table (id uuid, nickname text, role text, halls_cleared int, prestige int, night_coins int, coins int, balance int,
               banned_until timestamptz, ban_reason text, mod_note text, updated_at timestamptz, title text)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  return query
    select p.id, p.nickname, p.role, p.halls_cleared, p.prestige, p.night_coins,
           coalesce((p.save->>'coins')::numeric, 0)::int, coalesce((p.save->>'balance')::numeric, 0)::int,
           p.banned_until, p.ban_reason, p.mod_note, p.updated_at, p.title
    from public.profiles p
    where coalesce(q, '') = '' or p.nickname ilike '%' || q || '%'
    order by p.updated_at desc
    limit least(greatest(lim, 1), 200);
end $$;
grant execute on function public.mod_list(text, int) to authenticated;

-- ── Ogłoszenia (2026-10-21) ─────────────────────────────────────────────────────────────────
create table if not exists public.announcements (
  id bigint generated always as identity primary key,
  body text not null check (char_length(body) between 1 and 300),
  kind text not null default 'info' check (kind in ('info', 'warning', 'event', 'sponsored')),
  author text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '1 day'
);
alter table public.announcements enable row level security;
drop policy if exists "announcements read" on public.announcements;
create policy "announcements read" on public.announcements for select using (expires_at > now());
grant select on public.announcements to anon, authenticated;

-- Wysyłka i wycofanie: tylko moderator, przez funkcje sprawdzające rolę.
create or replace function public.mod_announce(body text, kind text default 'info', seconds int default 60) returns jsonb
language plpgsql security definer set search_path = public as $$
declare row_out public.announcements%rowtype; who text;
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  select nickname into who from public.profiles where id = auth.uid();
  insert into public.announcements (body, kind, author, expires_at)
  values (trim(body), coalesce(nullif(kind, ''), 'info'), who, now() + make_interval(secs => greatest(10, least(seconds, 2592000))))
  returning * into row_out;
  return to_jsonb(row_out);
end $$;
create or replace function public.mod_unannounce(target bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  update public.announcements set expires_at = now() where id = target;
  return jsonb_build_object('ok', found);
end $$;
grant execute on function public.mod_announce(text, text, int) to authenticated;
grant execute on function public.mod_unannounce(bigint) to authenticated;
alter table public.announcements replica identity full;

-- Realtime: nowe wiersze lecą do przeglądarek przez WebSocket (gra ma też odpytywanie co 15 s na wypadek braku połączenia).
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'announcements') then
    alter publication supabase_realtime add table public.announcements;
  end if;
end $$;

-- ── Tryb serwisowy (2026-10-21) ─────────────────────────────────────────────────────────────
create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
drop policy if exists "settings read" on public.settings;
create policy "settings read" on public.settings for select using (true);
grant select on public.settings to anon, authenticated;
insert into public.settings (key, value) values ('maintenance', '{"enabled": false, "message": ""}'::jsonb) on conflict (key) do nothing;
alter table public.settings replica identity full;

create or replace function public.maintenance_on() returns boolean
language sql security definer set search_path = public stable as $$
  select coalesce((select (value->>'enabled')::boolean from public.settings where key = 'maintenance'), false);
$$;
grant execute on function public.maintenance_on() to anon, authenticated;

-- Tylko admin włącza i wyłącza; komunikat do 200 znaków.
create or replace function public.mod_set_maintenance(enabled boolean, message text default '') returns jsonb
language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  v := jsonb_build_object('enabled', coalesce(enabled, false), 'message', left(coalesce(message, ''), 200), 'since', now());
  insert into public.settings (key, value, updated_at) values ('maintenance', v, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
  return v;
end $$;
grant execute on function public.mod_set_maintenance(boolean, text) to authenticated;

-- W serwisie zwykli gracze nie zapiszą nic w chmurze; moderatorzy tak.
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update
  using (auth.uid() = id and (banned_until is null or banned_until < now()) and (not public.maintenance_on() or public.is_mod()))
  with check (auth.uid() = id);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'settings') then
    alter publication supabase_realtime add table public.settings;
  end if;
end $$;

-- ── Korekty moderatora dostarczane graczowi (2026-10-26) ──
-- Korekty żetonów i salda z panelu moderatora, które docierają do gracza.
-- Dotąd mod_adjust zmieniał tylko kolumnę save, a klient gracza nadpisywał ją własnym zapisem.
-- Teraz korekta trafia też do pending_coins / pending_balance; gra gracza pobiera je przez claim_adjustments() i dolicza lokalnie.
alter table public.profiles add column if not exists pending_coins integer not null default 0;
alter table public.profiles add column if not exists pending_balance integer not null default 0;

create or replace function public.mod_adjust(target uuid, coins_delta int default 0, balance_delta int default 0) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s jsonb; c numeric; b numeric;
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  select save into s from public.profiles where id = target;
  if s is null then
    -- gracz jeszcze nic nie zapisał: zostaje sama korekta oczekująca
    update public.profiles set pending_coins = pending_coins + coins_delta, pending_balance = pending_balance + balance_delta, updated_at = now() where id = target;
    if not found then return jsonb_build_object('ok', false); end if;
    return jsonb_build_object('ok', true, 'pending', true);
  end if;
  c := greatest(0, coalesce((s->>'coins')::numeric, 0) + coins_delta);
  b := greatest(0, coalesce((s->>'balance')::numeric, 0) + balance_delta);
  s := jsonb_set(jsonb_set(s, '{coins}', to_jsonb(c::int), true), '{balance}', to_jsonb(b::int), true);
  update public.profiles set save = s, pending_coins = pending_coins + coins_delta, pending_balance = pending_balance + balance_delta, updated_at = now() where id = target;
  return jsonb_build_object('ok', true, 'coins', c::int, 'balance', b::int);
end $$;
grant execute on function public.mod_adjust(uuid, int, int) to authenticated;

-- Gracz odbiera swoje korekty: odczyt i wyzerowanie w jednej transakcji.
create or replace function public.claim_adjustments() returns jsonb
language plpgsql security definer set search_path = public as $$
declare c int := 0; b int := 0;
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  perform set_config('museum.claim', '1', true);
  select pending_coins, pending_balance into c, b from public.profiles where id = auth.uid() for update;
  if c is null then return jsonb_build_object('ok', true, 'coins', 0, 'balance', 0); end if;
  if c <> 0 or b <> 0 then update public.profiles set pending_coins = 0, pending_balance = 0 where id = auth.uid(); end if;
  return jsonb_build_object('ok', true, 'coins', c, 'balance', b);
end $$;
grant execute on function public.claim_adjustments() to authenticated;

-- Gracz nie może sam sobie wpisać korekt: zwykły UPDATE zachowuje stare wartości, chyba że robi to moderator albo claim_adjustments().
create or replace function public.guard_pending_adjustments() returns trigger
language plpgsql as $$
begin
  if current_setting('museum.claim', true) = '1' or public.is_mod() then return new; end if;
  new.pending_coins := old.pending_coins; new.pending_balance := old.pending_balance;
  return new;
end $$;
drop trigger if exists profiles_guard_pending on public.profiles;
create trigger profiles_guard_pending before update on public.profiles for each row execute function public.guard_pending_adjustments();

-- ── Wiele rang na profilu (2026-10-26) ──
-- Wiele rang na profilu: kolumna titles[] (title zostaje jako pierwsza ranga dla zgodności). Wklej w SQL Editorze Supabase.
alter table public.profiles add column if not exists titles text[] not null default '{}';
update public.profiles set titles = array[title] where title is not null and (titles is null or titles = '{}');
alter table public.profiles drop constraint if exists profiles_titles_check;
alter table public.profiles add constraint profiles_titles_check check (titles <@ array['owner', 'first-to-arrive', 'founder', 'veteran', 'patron', 'demon-slayer']::text[]);

-- Gracz nie może sam sobie zmienić rang (rozszerzenie istniejącego strażnika kolumn moderacyjnych).
create or replace function public.protect_mod_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if not public.is_mod() then
    new.role := old.role; new.banned_until := old.banned_until; new.ban_reason := old.ban_reason; new.mod_note := old.mod_note; new.title := old.title; new.titles := old.titles;
  elsif new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;

-- Ustawienie pełnej listy rang; FIRST TO ARRIVE może mieć tylko jedna osoba.
create or replace function public.mod_set_titles(target uuid, new_titles text[]) returns jsonb
language plpgsql security definer set search_path = public as $$
declare cleaned text[];
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  select coalesce(array_agg(distinct t order by t), '{}') into cleaned from unnest(coalesce(new_titles, '{}')) as t where nullif(trim(t), '') is not null;
  if 'first-to-arrive' = any(cleaned) and exists (select 1 from public.profiles where ('first-to-arrive' = any(titles) or title = 'first-to-arrive') and id <> target) then raise exception 'title_taken'; end if;
  update public.profiles set titles = cleaned, title = cleaned[1], updated_at = now() where id = target;
  return jsonb_build_object('ok', found, 'titles', to_jsonb(cleaned));
end $$;
grant execute on function public.mod_set_titles(uuid, text[]) to authenticated;

-- Stara funkcja jednej rangi: zostaje dla zgodności, ustawia listę z jednym elementem.
create or replace function public.mod_set_title(target uuid, new_title text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  return public.mod_set_titles(target, case when nullif(trim(new_title), '') is null then '{}'::text[] else array[trim(new_title)] end);
end $$;

-- Ranking i lista moderatora pokazują wszystkie rangi.
create or replace view public.leaderboard as
  select nickname, halls_cleared, prestige, fastest_night, night_coins, updated_at, title, titles
  from public.profiles
  order by halls_cleared desc, prestige desc, fastest_night asc nulls last
  limit 100;
grant select on public.leaderboard to anon, authenticated;

drop function if exists public.mod_list(text, int);
create or replace function public.mod_list(q text default '', lim int default 50)
returns table (id uuid, nickname text, role text, halls_cleared int, prestige int, night_coins int, coins int, balance int,
               banned_until timestamptz, ban_reason text, mod_note text, updated_at timestamptz, title text, titles text[])
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  return query
    select p.id, p.nickname, p.role, p.halls_cleared, p.prestige, p.night_coins,
           coalesce((p.save->>'coins')::numeric, 0)::int, coalesce((p.save->>'balance')::numeric, 0)::int,
           p.banned_until, p.ban_reason, p.mod_note, p.updated_at, p.title, p.titles
    from public.profiles p
    where coalesce(q, '') = '' or p.nickname ilike '%' || q || '%'
    order by p.updated_at desc
    limit least(greatest(lim, 1), 200);
end $$;
grant execute on function public.mod_list(text, int) to authenticated;
-- Bonus powitalny: 1000 żetonów i 50 zł dla KAŻDEGO NOWEGO konta, przyznawane dokładnie raz.
-- Mechanizm: w chwili założenia konta (trigger na auth.users tworzy wiersz w profiles) bonus trafia do pending_coins / pending_balance
-- z tej samej kolejki korekt, którą gracz odbiera przez claim_adjustments(). Odbiór zeruje kolejkę, więc powtórne logowania nic nie dają.
-- Konta istniejące przed migracją dostają znacznik welcome_bonus_at = now() i bonusu nie otrzymują.

alter table public.profiles add column if not exists welcome_bonus_at timestamptz;
alter table public.profiles add column if not exists welcome_claimed boolean not null default false;

-- Stare konta: oznaczone jako obsłużone, żeby backfill nie dał im bonusu.
update public.profiles set welcome_bonus_at = now(), welcome_claimed = true where welcome_bonus_at is null;

-- Nowe konto: bonus dopisywany PRZED wstawieniem wiersza (trigger guard_pending działa tylko na UPDATE, więc nic go nie zeruje).
create or replace function public.grant_welcome_bonus() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.welcome_bonus_at is null then
    new.welcome_bonus_at := now();
    new.welcome_claimed := false;
    new.pending_coins := coalesce(new.pending_coins, 0) + 1000;
    new.pending_balance := coalesce(new.pending_balance, 0) + 5000;   -- grosze: 50,00 zł
  end if;
  return new;
end $$;
drop trigger if exists profiles_welcome_bonus on public.profiles;
create trigger profiles_welcome_bonus before insert on public.profiles for each row execute function public.grant_welcome_bonus();

-- Odbiór korekt zwraca też flagę welcome przy pierwszym odbiorze bonusu, żeby gra pokazała powitanie zamiast komunikatu o korekcie moderatora.
create or replace function public.claim_adjustments() returns jsonb
language plpgsql security definer set search_path = public as $$
declare c int := 0; b int := 0; w boolean := false; wc boolean := true;
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  perform set_config('museum.claim', '1', true);
  select pending_coins, pending_balance, welcome_claimed into c, b, wc from public.profiles where id = auth.uid() for update;
  if c is null then return jsonb_build_object('ok', true, 'coins', 0, 'balance', 0, 'welcome', false); end if;
  w := (wc = false);
  if c <> 0 or b <> 0 or w then update public.profiles set pending_coins = 0, pending_balance = 0, welcome_claimed = true where id = auth.uid(); end if;
  return jsonb_build_object('ok', true, 'coins', c, 'balance', b, 'welcome', w);
end $$;
grant execute on function public.claim_adjustments() to authenticated;
