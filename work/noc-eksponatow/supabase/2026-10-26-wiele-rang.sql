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
