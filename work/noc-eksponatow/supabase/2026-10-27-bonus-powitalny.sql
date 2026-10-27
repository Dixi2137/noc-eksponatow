-- Bonus powitalny: 1000 żetonów i 50 zł dla KAŻDEGO NOWEGO konta, przyznawane dokładnie raz.
-- Mechanizm: w chwili założenia konta (trigger na auth.users tworzy wiersz w profiles) bonus trafia do pending_coins / pending_balance
-- z tej samej kolejki korekt, którą gracz odbiera przez claim_adjustments(). Odbiór zeruje kolejkę, więc powtórne logowania nic nie dają.
-- Konta istniejące przed migracją dostają znacznik welcome_bonus_at = now() i bonusu nie otrzymują.

alter table public.profiles add column if not exists welcome_bonus_at timestamptz;
alter table public.profiles add column if not exists welcome_claimed boolean not null default false;

-- Stare konta: oznaczone jako obsłużone, żeby backfill nie dał im bonusu.
update public.profiles set welcome_bonus_at = now(), welcome_claimed = true where welcome_bonus_at is null;

-- Nowe konto: bonus dopisywany PRZED wstawieniem wiersza (trigger guard_pending działa tylko na UPDATE, więc nic go nie zeruje).
create or replace function public.grant_welcome_bonus() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.welcome_bonus_at is null then
    new.welcome_bonus_at := now();
    new.welcome_claimed := false;
    new.pending_coins := coalesce(new.pending_coins, 0) + 1000;
    new.pending_balance := coalesce(new.pending_balance, 0) + 5000;   -- grosze: 50,00 zł
  end if;
  return new;
end $$;
drop trigger if exists profiles_welcome_bonus on public.profiles;
create trigger profiles_welcome_bonus before insert on public.profiles for each row execute function public.grant_welcome_bonus();

-- Odbiór korekt zwraca też flagę welcome przy pierwszym odbiorze bonusu, żeby gra pokazała powitanie zamiast komunikatu o korekcie moderatora.
create or replace function public.claim_adjustments() returns jsonb
language plpgsql security definer set search_path = public as $$
declare c int := 0; b int := 0; w boolean := false; wc boolean := true;
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
