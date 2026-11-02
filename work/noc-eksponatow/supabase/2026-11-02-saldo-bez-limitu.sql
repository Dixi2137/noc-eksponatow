-- Saldo i żetony bez górnego limitu (2026-11-02, faza157).
-- Klient nie ogranicza już salda do 1 000 000 zł. Po stronie bazy liczby przechodziły przez int4 (max ~21,47 mln zł w groszach),
-- więc kolumny korekt i funkcje moderatora przechodzą na bigint. Uruchom w Supabase (SQL Editor) raz.
alter table public.profiles alter column pending_coins type bigint;
alter table public.profiles alter column pending_balance type bigint;

drop function if exists public.mod_adjust(uuid, int, int);
create or replace function public.mod_adjust(target uuid, coins_delta bigint default 0, balance_delta bigint default 0) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s jsonb; c numeric; b numeric;
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  select save into s from public.profiles where id = target;
  if s is null then
    update public.profiles set pending_coins = pending_coins + coins_delta, pending_balance = pending_balance + balance_delta, updated_at = now() where id = target;
    if not found then return jsonb_build_object('ok', false); end if;
    return jsonb_build_object('ok', true, 'pending', true);
  end if;
  c := greatest(0, coalesce((s->>'coins')::numeric, 0) + coins_delta);
  b := greatest(0, coalesce((s->>'balance')::numeric, 0) + balance_delta);
  s := jsonb_set(jsonb_set(s, '{coins}', to_jsonb(c::bigint), true), '{balance}', to_jsonb(b::bigint), true);
  update public.profiles set save = s, pending_coins = pending_coins + coins_delta, pending_balance = pending_balance + balance_delta, updated_at = now() where id = target;
  return jsonb_build_object('ok', true, 'coins', c::bigint, 'balance', b::bigint);
end $$;
grant execute on function public.mod_adjust(uuid, bigint, bigint) to authenticated;

create or replace function public.claim_adjustments() returns jsonb
language plpgsql security definer set search_path = public as $$
declare c bigint := 0; b bigint := 0; w boolean := false; wc boolean := true;
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

drop function if exists public.mod_list(text, int);
create or replace function public.mod_list(q text default '', lim int default 50)
returns table (id uuid, nickname text, role text, halls_cleared int, prestige int, night_coins int, coins bigint, balance bigint,
               banned_until timestamptz, ban_reason text, mod_note text, updated_at timestamptz, title text)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_mod() then raise exception 'forbidden'; end if;
  return query
    select p.id, p.nickname, p.role, p.halls_cleared, p.prestige, p.night_coins,
           coalesce((p.save->>'coins')::numeric, 0)::bigint, coalesce((p.save->>'balance')::numeric, 0)::bigint,
           p.banned_until, p.ban_reason, p.mod_note, p.updated_at, p.title
    from public.profiles p
    where coalesce(q, '') = '' or p.nickname ilike '%' || q || '%'
    order by p.updated_at desc
    limit least(greatest(lim, 1), 200);
end $$;
grant execute on function public.mod_list(text, int) to authenticated;
