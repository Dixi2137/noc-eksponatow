-- Dla istniejącego projektu: wklej to w SQL Editorze (schema.sql ma to samo na końcu, dla nowych projektów).
-- ── Rangi honorowe (2026-10-21) ─────────────────────────────────────────────────────────────
-- Tytuł nadawany ręcznie przez moderatora, widoczny w rankingu i w koncie. „First to arrive” może mieć tylko jedna osoba.
alter table public.profiles add column if not exists title text;
alter table public.profiles drop constraint if exists profiles_title_check;
alter table public.profiles add constraint profiles_title_check check (title is null or title in ('first-to-arrive', 'founder', 'veteran', 'patron'));
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
