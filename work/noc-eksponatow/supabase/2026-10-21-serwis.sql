-- Tryb serwisowy (2026-10-21): jeden wiersz ustawień, przełączany przez admina, rozgłaszany przez Realtime.
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
