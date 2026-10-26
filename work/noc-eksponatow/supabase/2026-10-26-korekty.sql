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
