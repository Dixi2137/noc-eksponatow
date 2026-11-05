/* Rabunek: a logged-in player can try to rob anyone on the leaderboard, once per cooldown, picking the currency
   (tokens or PLN balance) and the amount, up to a quarter of what the victim holds in that currency. Without
   protection the odds are high: 90 % up to a 5 % share, falling to 60 % at 25 %. The server (Supabase `rob()`) rolls
   with the same formula from its own numbers and moves the money through the victim's pending adjustments; this
   module holds the shared numbers so the client can show odds and apply its own side of a result.
   Protection is a subscription: 10 000 ✦ or 20 000 zł a day, charged by the server (also while the player is offline)
   until the funds run out or the player cancels. A protected victim blocks the robbery and the robber pays them the
   amount they went for, capped at 20 % of the robber's own funds in that currency. */
(() => {
  'use strict';
  const COOLDOWN_MS = 10 * 60 * 1000;
  const MIN = Object.freeze({ coins: 10, pln: 100 });   // pln in grosze
  const MAX_SHARE = .25;                                 // of the victim's funds in the chosen currency
  const CHANCE = Object.freeze({ top: .9, floor: .6, easy: .05, slope: 1.5 });   // 90 % up to a 5 % share, −1.5 pp per extra pp of share, never under 60 %
  const PENALTY_SHARE = .2;                              // cap on the fine, as a share of the robber's own funds
  const SHIELD = Object.freeze({ coins: 10000, pln: 2000000 });   // daily fee, pln in grosze
  const integer = v => Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : 0;
  const signed = v => Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : 0;
  const field = currency => currency === 'pln' ? 'balance' : 'coins';
  const chance = share => Math.min(CHANCE.top, Math.max(CHANCE.floor, CHANCE.top - CHANCE.slope * (Number(share) - CHANCE.easy)));
  const maxLoot = victimFunds => Math.floor(integer(victimFunds) * MAX_SHARE);
  const penalty = (ownFunds, amount) => Math.min(integer(amount), Math.floor(integer(ownFunds) * PENALTY_SHARE));
  // Protection ends at the later of a one-off stamp and the subscription's paid day.
  const protectedUntil = (profile, now = Date.now()) => { const t = Math.max(Date.parse(profile?.protectedUntil || '') || 0, Date.parse(profile?.shield?.paidUntil || '') || 0); return t > now ? t : 0; };
  const isProtected = (profile, now = Date.now()) => protectedUntil(profile, now) > 0;
  const subscribed = profile => !!(profile?.shield?.currency && (profile.shield.currency === 'coins' || profile.shield.currency === 'pln'));
  const canAfford = (profile, currency) => currency === 'pln' ? signed(profile.balance) >= SHIELD.pln : integer(profile.coins) >= SHIELD.coins;
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
  window.MuseumRob = Object.freeze({ COOLDOWN_MS, MIN, MAX_SHARE, CHANCE, PENALTY_SHARE, SHIELD, chance, maxLoot, penalty, isProtected, protectedUntil, subscribed, canAfford, apply, describe, money, cooldownLeft });
})();
