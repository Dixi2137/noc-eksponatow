/* Automaty Kustosza: three reels of 16 stops each with the same symbol strip. Three of a kind pays by symbol; the
   beer mug ("kufel") is the top symbol and pays on its own: two anywhere ×8, one anywhere ×2. Stakes come from tokens
   or the PLN balance (grosze), the stake leaves at once and the payout waits in `profile.slots.pending` until the reels
   stop (or the next load). Return to player is about 91 % (tests/slots.js enumerates every combination). */
(() => {
  'use strict';
  const SYMBOLS = Object.freeze(['kufel', 'crown', 'sword', 'skull', 'pumpkin', 'coin']);
  const NAMES = Object.freeze({ kufel: 'KUFEL', crown: 'KORONA', sword: 'MIECZ', skull: 'CZASZKA', pumpkin: 'DYNIA', coin: 'MONETA' });
  // One strip, shared by all three reels: 1 kufel, 2 crowns, 3 swords, 3 skulls, 3 pumpkins, 4 coins. Order spreads the symbols out.
  const REEL = Object.freeze(['kufel', 'coin', 'sword', 'pumpkin', 'coin', 'skull', 'crown', 'coin', 'sword', 'skull', 'pumpkin', 'coin', 'crown', 'sword', 'skull', 'pumpkin']);
  const TRIPLE = Object.freeze({ kufel: 100, crown: 40, sword: 20, skull: 15, pumpkin: 10, coin: 6 });
  const KUFEL = Object.freeze({ 2: 8, 1: 2 });
  const MIN = Object.freeze({ coins: 10, pln: 100 });   // pln in grosze; no upper limit
  const integer = v => Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : 0;
  const signed = v => Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : 0;
  const stats = profile => ({ spins: integer(profile.slots?.spins), coinsNet: signed(profile.slots?.coinsNet), plnNet: signed(profile.slots?.plnNet), pending: null });
  const field = currency => currency === 'pln' ? 'balance' : 'coins';
  // Multiplier for three stopped symbols, and the rule that paid.
  function evaluate(symbols) {
    const [a, b, c] = symbols;
    if (a === b && b === c) return { multiplier: TRIPLE[a], rule: 'triple', symbol: a };
    const mugs = symbols.filter(s => s === 'kufel').length;
    if (KUFEL[mugs]) return { multiplier: KUFEL[mugs], rule: 'kufel', symbol: 'kufel', count: mugs };
    return { multiplier: 0, rule: null, symbol: null };
  }
  function canBet(profile, bet = {}) {
    const amount = integer(bet.amount), currency = bet.currency;
    if (currency !== 'coins' && currency !== 'pln') return { ok: false, reason: 'currency' };
    if (profile.slots?.pending) return { ok: false, reason: 'pending' };
    if (amount < MIN[currency]) return { ok: false, reason: 'min', min: MIN[currency] };
    if (integer(profile[field(currency)]) < amount) return { ok: false, reason: 'funds' };
    return { ok: true, amount };
  }
  // Takes the stake, stops each reel on a random stop, parks the payout. Null when the bet is not allowed.
  function spin(profile, bet, random = Math.random) {
    const check = canBet(profile, bet); if (!check.ok) return null;
    const stops = [0, 1, 2].map(() => Math.min(REEL.length - 1, Math.max(0, Math.floor(random() * REEL.length))));
    const symbols = stops.map(i => REEL[i]), result = evaluate(symbols);
    const payout = check.amount * result.multiplier, key = field(bet.currency);
    const s = stats(profile); s.spins += 1; s[bet.currency === 'pln' ? 'plnNet' : 'coinsNet'] += payout - check.amount;
    s.pending = payout ? { currency: bet.currency, amount: payout } : null;
    const next = { ...profile, [key]: integer(profile[key]) - check.amount, slots: s };
    return { profile: next, stops, symbols, ...result, win: payout > 0, payout, net: payout - check.amount, amount: check.amount, currency: bet.currency };
  }
  function settle(profile) {
    const p = profile.slots?.pending; if (!p || !integer(p.amount)) return { ...profile, slots: stats(profile) };
    const key = field(p.currency);   // no upper limit; a PLN debt keeps its sign, so the win pays it down first
    return { ...profile, [key]: (key === 'balance' ? signed(profile[key]) : integer(profile[key])) + integer(p.amount), slots: stats(profile) };
  }
  // Expected return per unit staked, by enumerating every stop combination.
  function rtp() { let total = 0; const n = REEL.length; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) total += evaluate([REEL[a], REEL[b], REEL[c]]).multiplier; return total / (n * n * n); }
  window.MuseumSlots = Object.freeze({ SYMBOLS, NAMES, REEL, TRIPLE, KUFEL, MIN, evaluate, canBet, spin, settle, stats, rtp });
})();
