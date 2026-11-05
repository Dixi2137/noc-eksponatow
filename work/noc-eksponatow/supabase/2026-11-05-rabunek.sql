-- Rabunek i ochrona (2026-11-05, faza164). Uruchom w Supabase (SQL Editor) raz.
-- Zalogowany gracz może raz na 10 minut spróbować okraść kogoś z rankingu (po nicku). Serwer losuje wynik:
--   ofiara chroniona  → napastnik płaci karę (10 % swoich żetonów, max 2000) na konto ofiary,
--   bez ochrony, 60 % → napastnik zabiera 8 % żetonów ofiary (max 3000),
--   bez ochrony, 40 % → nic się nie dzieje.
-- Ofiara dostaje zmianę przez pending_coins (odbiera claim_adjustments), napastnik dostaje swoją stronę w odpowiedzi i zapisuje lokalnie,
-- a serwer wpisuje ją też do jego save, żeby inny komputer zobaczył to samo. Ochrona: buy_protection(hours) stempluje protected_until
-- (klient płaci lokalnie żetonami albo saldem). Każdy napad ląduje w tabeli robberies, widocznej tylko dla obu stron.
alter table public.profiles add column if not exists protected_until timestamptz;
alter table public.profiles add column if not exists robbed_at timestamptz;

create table if not exists public.robberies (
  id bigserial primary key,
  robber uuid not null references public.profiles(id) on delete cascade,
  victim uuid not null references public.profiles(id) on delete cascade,
  robber_name text not null,
  victim_name text not null,
  outcome text not null check (outcome in ('success', 'failed', 'protected')),
  amount bigint not null default 0,
  at timestamptz not null default now()
);
alter table public.robberies enable row level security;
drop policy if exists robberies_mine on public.robberies;
create policy robberies_mine on public.robberies for select to authenticated using (robber = auth.uid() or victim = auth.uid());
create index if not exists robberies_victim_at on public.robberies (victim, at desc);
grant select on public.robberies to authenticated;

create or replace view public.leaderboard as
  select nickname, halls_cleared, prestige, fastest_night, night_coins, updated_at, title, titles,
         (protected_until is not null and protected_until > now()) as protected
  from public.profiles
  order by halls_cleared desc, prestige desc, fastest_night asc nulls last
  limit 100;
grant select on public.leaderboard to anon, authenticated;

create or replace function public.rob(target_name text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me public.profiles%rowtype; v public.profiles%rowtype; my_coins numeric; v_coins numeric; amt bigint := 0; outcome text; s jsonb;
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  select * into me from public.profiles where id = auth.uid();
  if me.id is null then return jsonb_build_object('ok', false, 'reason', 'noprofile'); end if;
  if me.banned_until is not null and me.banned_until > now() then return jsonb_build_object('ok', false, 'reason', 'banned'); end if;
  if me.robbed_at is not null and me.robbed_at + interval '10 minutes' > now() then
    return jsonb_build_object('ok', false, 'reason', 'cooldown', 'until', me.robbed_at + interval '10 minutes');
  end if;
  select * into v from public.profiles where lower(nickname) = lower(coalesce(target_name, ''));
  if v.id is null then return jsonb_build_object('ok', false, 'reason', 'nobody'); end if;
  if v.id = me.id then return jsonb_build_object('ok', false, 'reason', 'self'); end if;
  my_coins := greatest(0, coalesce((me.save->>'coins')::numeric, 0) + coalesce(me.pending_coins, 0));
  v_coins := greatest(0, coalesce((v.save->>'coins')::numeric, 0) + coalesce(v.pending_coins, 0));
  update public.profiles set robbed_at = now() where id = me.id;
  if v.protected_until is not null and v.protected_until > now() then
    amt := least(2000, floor(my_coins * 0.10))::bigint; outcome := 'protected';
    update public.profiles set pending_coins = pending_coins + amt, updated_at = now() where id = v.id;
  elsif random() < 0.6 then
    amt := least(3000, floor(v_coins * 0.08))::bigint; outcome := 'success';
    update public.profiles set pending_coins = pending_coins - amt, updated_at = now() where id = v.id;
  else
    outcome := 'failed';
  end if;
  -- The robber's side goes straight into the save (the client applies the same delta locally and pushes it anyway).
  if amt > 0 and me.save is not null then
    s := jsonb_set(me.save, '{coins}', to_jsonb(greatest(0, coalesce((me.save->>'coins')::numeric, 0) + case when outcome = 'success' then amt else -amt end)::bigint), true);
    update public.profiles set save = s where id = me.id;
  end if;
  insert into public.robberies (robber, victim, robber_name, victim_name, outcome, amount) values (me.id, v.id, me.nickname, v.nickname, outcome, amt);
  return jsonb_build_object('ok', true, 'outcome', outcome, 'amount', amt, 'victim', v.nickname, 'robber', me.nickname, 'until', now() + interval '10 minutes');
end $$;
grant execute on function public.rob(text) to authenticated;

create or replace function public.buy_protection(hours int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare until_ts timestamptz;
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  if hours not in (24, 168) then return jsonb_build_object('ok', false, 'reason', 'tier'); end if;
  update public.profiles set protected_until = greatest(coalesce(protected_until, now()), now()) + make_interval(hours => hours), updated_at = now()
    where id = auth.uid() returning protected_until into until_ts;
  if until_ts is null then return jsonb_build_object('ok', false, 'reason', 'noprofile'); end if;
  return jsonb_build_object('ok', true, 'protected_until', until_ts);
end $$;
grant execute on function public.buy_protection(int) to authenticated;

create or replace function public.rob_status() returns jsonb
language sql security definer set search_path = public stable as $$
  select jsonb_build_object('ok', true, 'protected_until', p.protected_until, 'next_rob_at', p.robbed_at + interval '10 minutes')
  from public.profiles p where p.id = auth.uid();
$$;
grant execute on function public.rob_status() to authenticated;
