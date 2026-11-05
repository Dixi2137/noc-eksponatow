-- Ochrona jako abonament i wysoka szansa napadu (2026-11-05, faza166). Uruchom w Supabase (SQL Editor) raz, PO 2026-11-05-rabunek-kwota.sql.
-- Abonament: 10 000 ✦ albo 20 000 zł dziennie, pobierane przez serwer z oczekujących korekt (pending_*), także gdy gracz jest offline:
-- każde sprawdzenie (napad na tego gracza, jego własny rob_status) dolicza zaległe dni; gdy nie ma z czego zapłacić, abonament gaśnie
-- i od tego dnia gracz jest bez ochrony. Napad bez ochrony: 90 % szans do 5 % udziału, liniowo do 60 % przy 25 %.
alter table public.profiles add column if not exists shield_currency text;
alter table public.profiles add column if not exists shield_paid_until timestamptz;
alter table public.profiles add column if not exists shield_days int not null default 0;

create or replace function public.shield_fee(currency text) returns bigint language sql immutable as $$
  select case when currency = 'pln' then 2000000::bigint else 10000::bigint end
$$;

-- Catches a player's subscription up to now: one fee per elapsed day while the funds (save + pending) cover it, otherwise it lapses.
create or replace function public.shield_settle(target uuid) returns void
language plpgsql security definer set search_path = public as $$
declare p public.profiles%rowtype; fee bigint; funds numeric; guard int := 0;
begin
  select * into p from public.profiles where id = target for update;
  if p.id is null or p.shield_currency is null then return; end if;
  fee := public.shield_fee(p.shield_currency);
  if p.shield_paid_until is null then p.shield_paid_until := now(); end if;
  while p.shield_currency is not null and p.shield_paid_until <= now() and guard < 400 loop
    guard := guard + 1;
    funds := coalesce((p.save->>(case when p.shield_currency = 'pln' then 'balance' else 'coins' end))::numeric, 0)
           + coalesce(case when p.shield_currency = 'pln' then p.pending_balance else p.pending_coins end, 0);
    if funds >= fee then
      if p.shield_currency = 'pln' then p.pending_balance := coalesce(p.pending_balance, 0) - fee; else p.pending_coins := coalesce(p.pending_coins, 0) - fee; end if;
      p.shield_paid_until := p.shield_paid_until + interval '1 day';
      p.shield_days := p.shield_days + 1;
    else
      p.shield_currency := null;
    end if;
  end loop;
  update public.profiles set pending_coins = p.pending_coins, pending_balance = p.pending_balance, shield_currency = p.shield_currency,
    shield_paid_until = p.shield_paid_until, shield_days = p.shield_days, updated_at = now() where id = target;
end $$;

create or replace function public.shield_status_of(p public.profiles) returns jsonb language sql immutable as $$
  select jsonb_build_object('ok', true,
    'protected_until', greatest(coalesce(p.protected_until, '-infinity'::timestamptz), coalesce(p.shield_paid_until, '-infinity'::timestamptz)),
    'shield_currency', p.shield_currency, 'shield_paid_until', p.shield_paid_until, 'shield_days', p.shield_days,
    'next_rob_at', p.robbed_at + interval '10 minutes')
$$;

create or replace function public.shield_subscribe(currency text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare p public.profiles%rowtype; fee bigint; funds numeric;
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  if currency not in ('coins', 'pln') then return jsonb_build_object('ok', false, 'reason', 'currency'); end if;
  perform public.shield_settle(auth.uid());
  select * into p from public.profiles where id = auth.uid() for update;
  if p.id is null then return jsonb_build_object('ok', false, 'reason', 'noprofile'); end if;
  if p.shield_currency is not null and p.shield_paid_until > now() then return public.shield_status_of(p) || jsonb_build_object('already', true); end if;
  fee := public.shield_fee(currency);
  funds := coalesce((p.save->>(case when currency = 'pln' then 'balance' else 'coins' end))::numeric, 0) + coalesce(case when currency = 'pln' then p.pending_balance else p.pending_coins end, 0);
  if funds < fee then return jsonb_build_object('ok', false, 'reason', 'funds'); end if;
  if currency = 'pln' then p.pending_balance := coalesce(p.pending_balance, 0) - fee; else p.pending_coins := coalesce(p.pending_coins, 0) - fee; end if;
  p.shield_currency := currency; p.shield_paid_until := greatest(now(), coalesce(p.protected_until, now())) + interval '1 day'; p.shield_days := p.shield_days + 1;
  update public.profiles set pending_coins = p.pending_coins, pending_balance = p.pending_balance, shield_currency = p.shield_currency,
    shield_paid_until = p.shield_paid_until, shield_days = p.shield_days, updated_at = now() where id = p.id;
  return public.shield_status_of(p);
end $$;
grant execute on function public.shield_subscribe(text) to authenticated;

-- Stops the daily fee; the paid day still protects until it ends.
create or replace function public.shield_cancel() returns jsonb
language plpgsql security definer set search_path = public as $$
declare p public.profiles%rowtype;
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  update public.profiles set shield_currency = null, updated_at = now() where id = auth.uid() returning * into p;
  if p.id is null then return jsonb_build_object('ok', false, 'reason', 'noprofile'); end if;
  return public.shield_status_of(p);
end $$;
grant execute on function public.shield_cancel() to authenticated;

create or replace function public.rob_status() returns jsonb
language plpgsql security definer set search_path = public as $$
declare p public.profiles%rowtype;
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  perform public.shield_settle(auth.uid());
  select * into p from public.profiles where id = auth.uid();
  if p.id is null then return jsonb_build_object('ok', false, 'reason', 'noprofile'); end if;
  return public.shield_status_of(p);
end $$;
grant execute on function public.rob_status() to authenticated;

create or replace view public.leaderboard as
  select nickname, halls_cleared, prestige, fastest_night, night_coins, updated_at, title, titles,
         ((protected_until is not null and protected_until > now()) or (shield_currency is not null and shield_paid_until > now())) as protected,
         greatest(0, coalesce((save->>'coins')::numeric, 0) + coalesce(pending_coins, 0))::bigint as coins,
         greatest(0, coalesce((save->>'balance')::numeric, 0) + coalesce(pending_balance, 0))::bigint as balance
  from public.profiles
  order by halls_cleared desc, prestige desc, fastest_night asc nulls last
  limit 100;
grant select on public.leaderboard to anon, authenticated;

create or replace function public.rob(target_name text, currency text default 'coins', amount bigint default 0) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me public.profiles%rowtype; v public.profiles%rowtype; my_funds numeric; v_funds numeric; amt bigint; min_amt bigint; share numeric; chance numeric; outcome text; s jsonb; delta bigint; key text; shielded boolean;
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
  select id into v from public.profiles where lower(nickname) = lower(coalesce(target_name, ''));
  if v.id is null then return jsonb_build_object('ok', false, 'reason', 'nobody'); end if;
  if v.id = me.id then return jsonb_build_object('ok', false, 'reason', 'self'); end if;
  perform public.shield_settle(v.id);
  select * into v from public.profiles where id = v.id;
  shielded := (v.protected_until is not null and v.protected_until > now()) or (v.shield_currency is not null and v.shield_paid_until > now());
  my_funds := greatest(0, coalesce((me.save->>key)::numeric, 0) + coalesce(case when currency = 'pln' then me.pending_balance else me.pending_coins end, 0));
  v_funds := greatest(0, coalesce((v.save->>key)::numeric, 0) + coalesce(case when currency = 'pln' then v.pending_balance else v.pending_coins end, 0));
  amt := least(greatest(coalesce(amount, 0), min_amt), floor(v_funds * 0.25))::bigint;
  if amt < min_amt then return jsonb_build_object('ok', false, 'reason', 'poor'); end if;
  share := amt / v_funds; chance := least(0.9, greatest(0.6, 0.9 - 1.5 * (share - 0.05)));
  update public.profiles set robbed_at = now() where id = me.id;
  if shielded then
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
  if delta <> 0 and me.save is not null then
    s := jsonb_set(me.save, array[key], to_jsonb((case when currency = 'pln' then coalesce((me.save->>key)::numeric, 0) + delta else greatest(0, coalesce((me.save->>key)::numeric, 0) + delta) end)::bigint), true);
    update public.profiles set save = s where id = me.id;
  end if;
  insert into public.robberies (robber, victim, robber_name, victim_name, outcome, amount, currency) values (me.id, v.id, me.nickname, v.nickname, outcome, amt, currency);
  return jsonb_build_object('ok', true, 'outcome', outcome, 'amount', amt, 'currency', currency, 'chance', round(chance, 2), 'victim', v.nickname, 'robber', me.nickname, 'until', now() + interval '10 minutes');
end $$;
grant execute on function public.rob(text, text, bigint) to authenticated;
