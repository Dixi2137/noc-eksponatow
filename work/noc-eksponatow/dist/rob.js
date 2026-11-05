/* Rabunek: a logged-in player can try to rob anyone on the leaderboard, once per cooldown. The server (Supabase
   `rob()`) rolls the outcome and moves the tokens through the victim's pending adjustments; this module holds the
   shared numbers so the client can explain odds, price protection and apply its own side of the result. Protection
   bought in the shop blocks every robbery for its duration and fines the robber in the victim's favour. */
(() => {
  'use strict';
  const COOLDOWN_MS = 10 * 60 * 1000;
  const SUCCESS = .6;                                   // chance when the victim is not protected
  const LOOT = Object.freeze({ rate: .08, cap: 3000 });   // share of the victim's tokens on a success
  const PENALTY = Object.freeze({ rate: .10, cap: 2000 }); // share of the robber's tokens paid to a protected victim
  const PROTECTION = Object.freeze({ 24: { label: '24 GODZINY', coins: 400, pln: 399 }, 168: { label: '7 DNI', coins: 2000, pln: 1999 } });   // pln in grosze
  const integer = v => Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : 0;
  const signed = v => Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : 0;
  const loot = victimCoins => Math.min(LOOT.cap, Math.floor(integer(victimCoins) * LOOT.rate));
  const penalty = robberCoins => Math.min(PENALTY.cap, Math.floor(integer(robberCoins) * PENALTY.rate));
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
  // The robber's own side of a server result: tokens in on a success, tokens out when the victim was protected.
  function apply(profile, result) {
    const amount = integer(result?.amount);
    if (result?.outcome === 'success') return { ...profile, coins: integer(profile.coins) + amount };
    if (result?.outcome === 'protected') return { ...profile, coins: Math.max(0, integer(profile.coins) - amount) };
    return profile;
  }
  const words = n => `${new Intl.NumberFormat('pl-PL').format(integer(n))} ✦`;
  // One line for the robber, one for the victim.
  function describe(result, me) {
    const a = words(result.amount);
    if (result.outcome === 'success') return me === 'robber' ? `Udało się! Zwinąłeś ${a} od ${result.victim}.` : `NAPAD! ${result.robber} okradł cię na ${a}.`;
    if (result.outcome === 'protected') return me === 'robber' ? `${result.victim} ma ochronę. Kara ${a} poszła na jego konto.` : `${result.robber} próbował cię okraść. Ochrona zadziałała: +${a} kary od napastnika.`;
    return me === 'robber' ? `Stróż nocny cię spłoszył. ${result.victim} nic nie stracił, ty też nie.` : `${result.robber} próbował cię okraść, ale spłoszył go stróż.`;
  }
  const cooldownLeft = (untilIso, now = Date.now()) => Math.max(0, (Date.parse(untilIso || '') || 0) - now);
  window.MuseumRob = Object.freeze({ COOLDOWN_MS, SUCCESS, LOOT, PENALTY, PROTECTION, loot, penalty, isProtected, protectedUntil, canAfford, pay, apply, describe, cooldownLeft });
})();
