/* Rabunek: a logged-in player can try to rob anyone on the leaderboard, once per cooldown, picking the currency
   (tokens or PLN balance) and the amount, up to a quarter of what the victim holds in that currency. The chance falls
   with the share taken: 60 % at 5 % of the victim's funds, down to 10 % at 25 %. The server (Supabase `rob()`) rolls
   with the same formula from its own numbers and moves the money through the victim's pending adjustments; this
   module holds the shared numbers so the client can show odds, price protection and apply its own side. Protection
   bought in the shop blocks every robbery for its duration and fines the robber in the victim's favour: the amount
   they went for, capped at 20 % of their own funds in that currency. */
(() => {
  'use strict';
  const COOLDOWN_MS = 10 * 60 * 1000;
  const MIN = Object.freeze({ coins: 10, pln: 100 });   // pln in grosze
  const MAX_SHARE = .25;                                 // of the victim's funds in the chosen currency
  const CHANCE = Object.freeze({ top: .6, floor: .1, easy: .05, slope: 2.5 });   // 60 % up to a 5 % share, −2.5 pp per extra pp of share, never under 10 %
  const PENALTY_SHARE = .2;                              // cap on the fine, as a share of the robber's own funds
  const PROTECTION = Object.freeze({ 24: { label: '24 GODZINY', coins: 400, pln: 399 }, 168: { label: '7 DNI', coins: 2000, pln: 1999 } });   // pln in grosze
  const integer = v => Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : 0;
  const signed = v => Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : 0;
  const field = currency => currency === 'pln' ? 'balance' : 'coins';
  const chance = share => Math.min(CHANCE.top, Math.max(CHANCE.floor, CHANCE.top - CHANCE.slope * (Number(share) - CHANCE.easy)));
  const maxLoot = victimFunds => Math.floor(integer(victimFunds) * MAX_SHARE);
  const penalty = (ownFunds, amount) => Math.min(integer(amount), Math.floor(integer(ownFunds) * PENALTY_SHARE));
  const protectedUntil = profile => { const t = Date.parse(profile?.protectedUntil || ''); return Number.isFinite(t) && t > Date.now() ? t : 0; };
  const isProtected = (profile, now = Date.now()) => { const t = Date.parse(profile?.protectedUntil || ''); return Number.isFinite(t) && t > now; };
  function canAfford(profile, hours, currency) {
    const tier = PROTECTION[hours]; if (!tier) return false;
    return currency === 'pln' ? signed(profile.balance) >= tier.pln : integer(profile.coins) >= tier.coins;
  }
  // Pays for a tier locally; the server stamps `protected_until`. Null when the tier is unknown or the funds are short.
  function pay(profile, hours, currency, now = Date.now()) {
    const tier = PROTECTION[hours]; if (!tier || !canAfford(profile, hours, currency)) return null;
    const from = Math.max(now, Date.parse(profile.protectedUntil || '') || 0), until = new Date(from + Number(hours) * 3600000).toISOString();
    return currency === 'pln' ? { ...profile, balance: signed(profile.balance) - tier.pln, protectedUntil: until } : { ...profile, coins: integer(profile.coins) - tier.coins, protectedUntil: until };
  }
  // The robber's own side of a server result: funds in on a success, funds out when the victim was protected (tokens stop at zero, the balance may go into debt).
  function apply(profile, result) {
    const amount = integer(result?.amount), key = field(result?.currency);
    if (result?.outcome === 'success') return { ...profile, [key]: (key === 'balance' ? signed(profile[key]) : integer(profile[key])) + amount };
    if (result?.outcome === 'protected') return { ...profile, [key]: key === 'balance' ? signed(profile[key]) - amount : Math.max(0, integer(profile[key]) - amount) };
    return profile;
  }
  const money = (n, currency) => currency === 'pln' ? (integer(n) / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' }) : `${new Intl.NumberFormat('pl-PL').format(integer(n))} ✦`;
  // One line for the robber, one for the victim.
  function describe(result, me) {
    const a = money(result.amount, result.currency);
    if (result.outcome === 'success') return me === 'robber' ? `Udało się! Zwinąłeś ${a} od ${result.victim}.` : `NAPAD! ${result.robber} okradł cię na ${a}.`;
    if (result.outcome === 'protected') return me === 'robber' ? `${result.victim} ma ochronę. Kara ${a} poszła na jego konto.` : `${result.robber} próbował cię okraść. Ochrona zadziałała: +${a} kary od napastnika.`;
    return me === 'robber' ? `Stróż nocny cię spłoszył. ${result.victim} nic nie stracił, ty też nie.` : `${result.robber} próbował cię okraść, ale spłoszył go stróż.`;
  }
  const cooldownLeft = (untilIso, now = Date.now()) => Math.max(0, (Date.parse(untilIso || '') || 0) - now);
  window.MuseumRob = Object.freeze({ COOLDOWN_MS, MIN, MAX_SHARE, CHANCE, PENALTY_SHARE, PROTECTION, chance, maxLoot, penalty, isProtected, protectedUntil, canAfford, pay, apply, describe, money, cooldownLeft });
})();
