-- Rabunek z wyborem kwoty i waluty (2026-11-05, faza165). Uruchom w Supabase (SQL Editor) raz, PO 2026-11-05-rabunek.sql.
-- Napastnik wybiera walutę (żetony albo saldo zł) i kwotę do 25 % majątku ofiary w tej walucie. Szansa spada z udziałem:
--   60 % przy 5 % majątku, liniowo do 10 % przy 25 %. Ofiara z ochroną: napastnik płaci karę równą żądanej kwocie,
--   ale nie więcej niż 20 % własnego majątku w tej walucie. Ranking pokazuje majątek (żetony i saldo), żeby było co wybierać.
alter table public.robberies add column if not exists currency text not null default 'coins';

create or replace view public.leaderboard as
  select nickname, halls_cleared, prestige, fastest_night, night_coins, updated_at, title, titles,
         (protected_until is not null and protected_until > now()) as protected,
         greatest(0, coalesce((save->>'coins')::numeric, 0) + coalesce(pending_coins, 0))::bigint as coins,
         greatest(0, coalesce((save->>'balance')::numeric, 0) + coalesce(pending_balance, 0))::bigint as balance
  from public.profiles
  order by halls_cleared desc, prestige desc, fastest_night asc nulls last
  limit 100;
grant select on public.leaderboard to anon, authenticated;

drop function if exists public.rob(text);
create or replace function public.rob(target_name text, currency text default 'coins', amount bigint default 0) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me public.profiles%rowtype; v public.profiles%rowtype; my_funds numeric; v_funds numeric; amt bigint; min_amt bigint; share numeric; chance numeric; outcome text; s jsonb; delta bigint; key text;
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  if currency not in ('coins', 'pln') then return jsonb_build_object('ok', false, 'reason', 'currency'); end if;
  key := case when currency = 'pln' then 'balance' else 'coins' end; min_amt := case when currency = 'pln' then 100 else 10 end;
  select * into me from public.profiles where id = auth.uid();
  if me.id is null then return jsonb_build_object('ok', false, 'reason', 'noprofile'); end if;
  if me.banned_until is not null and me.banned_until > now() then return jsonb_build_object('ok', false, 'reason', 'banned'); end if;
  if me.robbed_at is not null and me.robbed_at + interval '10 minutes' > now() then
    return jsonb_build_object('ok', false, 'reason', 'cooldown', 'until', me.robbed_at + interval '10 minutes');
  end if;
  select * into v from public.profiles where lower(nickname) = lower(coalesce(target_name, ''));
  if v.id is null then return jsonb_build_object('ok', false, 'reason', 'nobody'); end if;
  if v.id = me.id then return jsonb_build_object('ok', false, 'reason', 'self'); end if;
  my_funds := greatest(0, coalesce((me.save->>key)::numeric, 0) + coalesce(case when currency = 'pln' then me.pending_balance else me.pending_coins end, 0));
  v_funds := greatest(0, coalesce((v.save->>key)::numeric, 0) + coalesce(case when currency = 'pln' then v.pending_balance else v.pending_coins end, 0));
  amt := least(greatest(coalesce(amount, 0), min_amt), floor(v_funds * 0.25))::bigint;
  if amt < min_amt then return jsonb_build_object('ok', false, 'reason', 'poor'); end if;
  share := amt / v_funds; chance := least(0.6, greatest(0.1, 0.6 - 2.5 * (share - 0.05)));
  update public.profiles set robbed_at = now() where id = me.id;
  if v.protected_until is not null and v.protected_until > now() then
    amt := least(amt, floor(my_funds * 0.20))::bigint; outcome := 'protected'; delta := -amt;
    if currency = 'pln' then update public.profiles set pending_balance = pending_balance + amt, updated_at = now() where id = v.id;
    else update public.profiles set pending_coins = pending_coins + amt, updated_at = now() where id = v.id; end if;
  elsif random() < chance then
    outcome := 'success'; delta := amt;
    if currency = 'pln' then update public.profiles set pending_balance = pending_balance - amt, updated_at = now() where id = v.id;
    else update public.profiles set pending_coins = pending_coins - amt, updated_at = now() where id = v.id; end if;
  else
    outcome := 'failed'; amt := 0; delta := 0;
  end if;
  -- The robber's side goes straight into the save (the client applies the same delta locally and pushes it anyway). Tokens never go below zero; the balance may (debt).
  if delta <> 0 and me.save is not null then
    s := jsonb_set(me.save, array[key], to_jsonb((case when currency = 'pln' then coalesce((me.save->>key)::numeric, 0) + delta else greatest(0, coalesce((me.save->>key)::numeric, 0) + delta) end)::bigint), true);
    update public.profiles set save = s where id = me.id;
  end if;
  insert into public.robberies (robber, victim, robber_name, victim_name, outcome, amount, currency) values (me.id, v.id, me.nickname, v.nickname, outcome, amt, currency);
  return jsonb_build_object('ok', true, 'outcome', outcome, 'amount', amt, 'currency', currency, 'chance', round(chance, 2), 'victim', v.nickname, 'robber', me.nickname, 'until', now() + interval '10 minutes');
end $$;
grant execute on function public.rob(text, text, bigint) to authenticated;
