-- Ogłoszenia dla wszystkich graczy w czasie rzeczywistym (2026-10-21). Wklej w SQL Editorze; schema.sql ma to samo na końcu.
create table if not exists public.announcements (
  id bigint generated always as identity primary key,
  body text not null check (char_length(body) between 1 and 300),
  kind text not null default 'info' check (kind in ('info', 'warning', 'event')),
  author text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '1 day'
);
alter table public.announcements enable row level security;
drop policy if exists "announcements read" on public.announcements;
create policy "announcements read" on public.announcements for select using (expires_at > now());
grant select on public.announcements to anon, authenticated;

-- Wysyłka i wycofanie: tylko moderator, przez funkcje sprawdzające rolę.
create or replace function public.mod_announce(body text, kind text default 'info', hours int default 24) returns jsonb
language plpgsql security definer set search_path = public as $$
declare row_out public.announcements%rowtype; who text;
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  select nickname into who from public.profiles where id = auth.uid();
  insert into public.announcements (body, kind, author, expires_at)
  values (trim(body), coalesce(nullif(kind, ''), 'info'), who, now() + make_interval(hours => greatest(1, least(hours, 24 * 30))))
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

-- Realtime: nowe wiersze lecą do przeglądarek przez WebSocket (gra ma też odpytywanie co 15 s na wypadek braku połączenia).
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'announcements') then
    alter publication supabase_realtime add table public.announcements;
  end if;
end $$;
