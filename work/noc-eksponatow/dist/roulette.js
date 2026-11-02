/* Ruletka Kustosza: a 15-field strip (7 red, 7 black, one green "Kustosz"). Red and black pay ×2, green ×14.
   Stakes come from tokens or the PLN balance (grosze). A spin takes the stake at once and parks the payout as
   `roulette.pending`; `settle` credits it after the strip stops (or on the next load, so a refresh never eats a win). */
(() => {
  'use strict';
  const WHEEL = Object.freeze(['green', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black']);
  const PAYOUT = Object.freeze({ red: 2, black: 2, green: 14 });
  const MIN = Object.freeze({ coins: 10, pln: 100 });          // pln in grosze; no upper limit: the stake is whatever the player holds
  const integer = v => Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : 0;
  const signed = v => Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : 0;
  const stats = profile => ({ spins: integer(profile.roulette?.spins), coinsNet: signed(profile.roulette?.coinsNet), plnNet: signed(profile.roulette?.plnNet), pending: null });
  const field = currency => currency === 'pln' ? 'balance' : 'coins';
  function canBet(profile, bet = {}) {
    const amount = integer(bet.amount), currency = bet.currency;
    if (!PAYOUT[bet.color]) return { ok: false, reason: 'color' };
    if (currency !== 'coins' && currency !== 'pln') return { ok: false, reason: 'currency' };
    if (profile.roulette?.pending) return { ok: false, reason: 'pending' };
    if (amount < MIN[currency]) return { ok: false, reason: 'min', min: MIN[currency] };
    if (integer(profile[field(currency)]) < amount) return { ok: false, reason: 'funds' };
    return { ok: true, amount };
  }
  // Takes the stake, draws the field, parks the payout. Returns null when the bet is not allowed.
  function spin(profile, bet, random = Math.random) {
    const check = canBet(profile, bet); if (!check.ok) return null;
    const index = Math.min(WHEEL.length - 1, Math.max(0, Math.floor(random() * WHEEL.length))), color = WHEEL[index];
    const win = color === bet.color, payout = win ? check.amount * PAYOUT[bet.color] : 0, key = field(bet.currency);
    const s = stats(profile); s.spins += 1; s[bet.currency === 'pln' ? 'plnNet' : 'coinsNet'] += payout - check.amount;
    s.pending = payout ? { currency: bet.currency, amount: payout } : null;
    const next = { ...profile, [key]: integer(profile[key]) - check.amount, roulette: s };
    return { profile: next, index, color, win, payout, net: payout - check.amount, amount: check.amount, currency: bet.currency };
  }
  // Credits the parked payout. Safe to call when nothing is pending.
  function settle(profile) {
    const p = profile.roulette?.pending; if (!p || !integer(p.amount)) return { ...profile, roulette: stats(profile) };
    const key = field(p.currency);   // no upper limit on tokens or balance
    return { ...profile, [key]: integer(profile[key]) + integer(p.amount), roulette: stats(profile) };
  }
  window.MuseumRoulette = Object.freeze({ WHEEL, PAYOUT, MIN, canBet, spin, settle, stats });
})();
