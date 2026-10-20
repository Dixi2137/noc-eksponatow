-- Ogłoszenia: czas życia w sekundach (od 10 s do 30 dni) zamiast godzin; aktualizacje (wycofanie) też lecą przez Realtime.
drop function if exists public.mod_announce(text, text, int);
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
grant execute on function public.mod_announce(text, text, int) to authenticated;
alter table public.announcements replica identity full;
