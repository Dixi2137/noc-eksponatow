-- Debet na saldzie (2026-11-02, faza158). Korekta moderatora może zejść poniżej zera: saldo zł nie jest już ucinane do 0.
-- Żetony nadal nie schodzą poniżej zera. Uruchom w Supabase (SQL Editor) raz.
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
  b := coalesce((s->>'balance')::numeric, 0) + balance_delta;
  s := jsonb_set(jsonb_set(s, '{coins}', to_jsonb(c::bigint), true), '{balance}', to_jsonb(b::bigint), true);
  update public.profiles set save = s, pending_coins = pending_coins + coins_delta, pending_balance = pending_balance + balance_delta, updated_at = now() where id = target;
  return jsonb_build_object('ok', true, 'coins', c::bigint, 'balance', b::bigint);
end $$;
grant execute on function public.mod_adjust(uuid, bigint, bigint) to authenticated;
