/* Automaty Kustosza: sixteen machines on one engine. Each machine has its own strip of 16 stops (built from symbol
   counts, spread evenly), a paytable for three of a kind and one bonus rule:
     scatter    – a symbol pays anywhere (1 or 2 on the line, 3 is its triple or its own scatter line)
     wild       – a symbol stands in for any other in a three of a kind
     pair       – any two matching symbols pay a small flat multiplier
     multiplier – pairs pay, and the bonus symbol on the middle reel multiplies that pair
     freespins  – three bonus symbols give N spins at the same stake for free (they cannot retrigger)
     jackpot    – a share of every stake feeds a pot per machine and currency; three top symbols pay the pot on top
   Stakes come from tokens or the PLN balance (grosze); the stake leaves at once and the payout waits in
   `profile.slots.pending` until the reels stop (or the next load). `rtp(machine)` enumerates all 4096 stop
   combinations, adds the expected free spins and the jackpot feed, and tests keep every machine within 86–95 %. */
(() => {
  'use strict';
  const MIN = Object.freeze({ coins: 10, pln: 100 });   // pln in grosze; no upper limit
  const integer = v => Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : 0;
  const signed = v => Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : 0;
  const field = currency => currency === 'pln' ? 'balance' : 'coins';
  // A 16-stop strip from per-symbol counts, interleaved so no symbol clusters.
  function strip(symbols, counts) {
    const slots = [];
    symbols.forEach((sym, i) => { for (let j = 0; j < counts[i]; j++) slots.push({ key: (j + .5 + i / symbols.length / 2) / counts[i], sym }); });
    return slots.sort((p, q) => p.key - q.key).map(s => s.sym);
  }
  const C = {   // cabinet colour schemes: body, bevel, trim, dark trim, lamp
    brass: { body: '#1b2616', bevel: '#33452a', trim: '#d4af37', trimDark: '#8a6a1a', lamp: '#ffd166' },
    oak: { body: '#3a2414', bevel: '#5a3a22', trim: '#d4af37', trimDark: '#8a6a1a', lamp: '#ffd166' },
    violet: { body: '#241a30', bevel: '#3a2a4a', trim: '#c9d6dc', trimDark: '#6d757a', lamp: '#b07ad0' },
    crimson: { body: '#2a1014', bevel: '#4a1a22', trim: '#d4af37', trimDark: '#8a6a1a', lamp: '#ff8f7a' },
    hell: { body: '#1a0808', bevel: '#3a0e0e', trim: '#b3202a', trimDark: '#7a1119', lamp: '#ff6b3a' },
    noir: { body: '#111114', bevel: '#23232a', trim: '#b3202a', trimDark: '#7a1119', lamp: '#f2efe6' },
    steel: { body: '#1c2226', bevel: '#2e383e', trim: '#c9d6dc', trimDark: '#6d757a', lamp: '#6fd3e0' },
    jungle: { body: '#14231a', bevel: '#24402c', trim: '#d4af37', trimDark: '#8a6a1a', lamp: '#ffd166' },
    space: { body: '#0e1426', bevel: '#1f2a4a', trim: '#c9d6dc', trimDark: '#6d757a', lamp: '#6fd3e0' },
    navy: { body: '#0e1a2a', bevel: '#1f3a6b', trim: '#d4af37', trimDark: '#8a6a1a', lamp: '#ffd166' },
    ivory: { body: '#2a2820', bevel: '#4a4636', trim: '#f2efe6', trimDark: '#9a9482', lamp: '#ffd166' },
    orchard: { body: '#1e2a10', bevel: '#36481c', trim: '#ffd166', trimDark: '#b08a2a', lamp: '#ff8fb0' },
    olive: { body: '#232616', bevel: '#3c4026', trim: '#9aa08a', trimDark: '#5c6050', lamp: '#ff6b6b' },
    gold: { body: '#2a200a', bevel: '#4a3a12', trim: '#ffd166', trimDark: '#b08a2a', lamp: '#ffffff' }
  };
  const M = (id, name, tag, cabinet, symbols, counts, triple, bonus, reel) => ({ id, name, tag, cabinet, symbols, reel: reel || strip(symbols, counts), triple, bonus });
  const MACHINES = Object.freeze([
    M('kufel', 'KUFEL KUSTOSZA', 'KLASYK · KUFEL PŁACI SAM', C.brass, ['kufel', 'crown', 'sword', 'skull', 'pumpkin', 'coin'], [1, 2, 3, 3, 3, 4],
      { kufel: 100, crown: 40, sword: 20, skull: 15, pumpkin: 10, coin: 6 }, { type: 'scatter', symbol: 'kufel', pays: { 2: 8, 1: 2 } },
      ['kufel', 'coin', 'sword', 'pumpkin', 'coin', 'skull', 'crown', 'coin', 'sword', 'skull', 'pumpkin', 'coin', 'crown', 'sword', 'skull', 'pumpkin']),
    M('browar', 'BROWAR', 'TRZY CHMIELE = DARMOWE OBROTY', C.oak, ['kufel', 'barrel', 'pretzel', 'bottle', 'cross', 'hops'], [1, 2, 3, 3, 4, 3],
      { kufel: 240, barrel: 80, pretzel: 40, bottle: 24, cross: 16 }, { type: 'freespins', symbol: 'hops', spins: 5 }),
    M('krypta', 'KRYPTA', 'DUCH ZASTĘPUJE KAŻDY SYMBOL', C.violet, ['ghost', 'skull', 'coffin', 'bat', 'pumpkin', 'candle'], [1, 2, 3, 3, 3, 4],
      { ghost: 65, skull: 30, coffin: 17, bat: 12, pumpkin: 8, candle: 5 }, { type: 'wild', symbol: 'ghost' }),
    M('tron', 'SALA TRONOWA', 'PARY PŁACĄ · PIERŚCIEŃ ×2', C.crimson, ['crown', 'chalice', 'shield', 'scroll', 'sword', 'ring'], [1, 2, 3, 3, 4, 3],
      { crown: 90, chalice: 34, shield: 17, scroll: 11, sword: 7, ring: 9 }, { type: 'multiplier', symbol: 'ring', times: 2, pair: 1 }),
    M('pieklo', 'PIEKŁO', 'RZADKO, ALE ×850', C.hell, ['belzebub', 'pitchfork', 'flame', 'horns', 'bone', 'coal'], [1, 1, 2, 3, 4, 5],
      { belzebub: 850, pitchfork: 200, flame: 70, horns: 26, bone: 10, coal: 5 }, { type: 'none' }),
    M('siodemki', 'SIÓDEMKI', 'KLASYK · KAŻDA PARA PŁACI', C.noir, ['seven', 'bar', 'bell', 'cherry', 'lemon', 'diamond'], [1, 2, 3, 3, 3, 4],
      { seven: 105, bar: 42, bell: 21, cherry: 13, lemon: 8, diamond: 5 }, { type: 'pair', pays: 1 }),
    M('klejnoty', 'KLEJNOTY', 'GWIAZDA JEST DZIKA', C.violet, ['star', 'gemred', 'gemblue', 'gemgreen', 'gemyellow', 'gempurple'], [1, 3, 3, 3, 3, 3],
      { star: 50, gemred: 21, gemblue: 13, gemgreen: 10, gemyellow: 8, gempurple: 7 }, { type: 'wild', symbol: 'star' }),
    M('zbrojownia', 'ZBROJOWNIA', 'PULA ROŚNIE Z KAŻDEJ STAWKI', C.steel, ['sword', 'helmet', 'axe', 'mace', 'bow', 'shield'], [1, 2, 3, 3, 3, 4],
      { sword: 265, helmet: 70, axe: 36, mace: 27, bow: 18, shield: 9 }, { type: 'jackpot', symbol: 'sword', feed: .04 }),
    M('dino', 'KREDA', 'METEOR PŁACI GDZIEKOLWIEK', C.jungle, ['meteor', 'trex', 'raptor', 'egg', 'bone', 'fern'], [1, 2, 3, 3, 3, 4],
      { meteor: 170, trex: 57, raptor: 28, egg: 17, bone: 11, fern: 7 }, { type: 'scatter', symbol: 'meteor', pays: { 2: 10, 1: 1 } }),
    M('kosmos', 'KOSMOS', 'TRZY RAKIETY = 6 DARMOWYCH', C.space, ['alien', 'planet', 'moon', 'comet', 'star', 'rocket'], [1, 2, 3, 3, 4, 3],
      { alien: 240, planet: 80, moon: 40, comet: 24, star: 16 }, { type: 'freespins', symbol: 'rocket', spins: 6 }),
    M('piraci', 'PIRACI', 'PARY PŁACĄ · PAPUGA ×3', C.oak, ['chest', 'skull', 'anchor', 'cannon', 'rum', 'parrot'], [1, 2, 3, 3, 4, 3],
      { chest: 95, skull: 32, anchor: 16, cannon: 9, rum: 6, parrot: 8 }, { type: 'multiplier', symbol: 'parrot', times: 3, pair: 1 }),
    M('kaplica', 'KAPLICA', 'GOŁĄB JEST DZIKI', C.ivory, ['dove', 'chalice', 'cross', 'bell', 'candle', 'book'], [1, 2, 3, 3, 3, 4],
      { dove: 65, chalice: 29, cross: 17, bell: 12, candle: 8, book: 5 }, { type: 'wild', symbol: 'dove' }),
    M('noc', 'NOC W MUZEUM', 'KLUCZ PŁACI GDZIEKOLWIEK', C.navy, ['key', 'owl', 'lantern', 'clock', 'moon', 'bat'], [1, 2, 3, 3, 3, 4],
      { key: 93, owl: 31, lantern: 16, clock: 9, moon: 6, bat: 4 }, { type: 'scatter', symbol: 'key', pays: { 2: 6, 1: 3 } }),
    M('owoce', 'OWOCE', 'SPOKOJNY · KAŻDA PARA PŁACI', C.orchard, ['melon', 'grapes', 'plum', 'orange', 'lemon', 'cherry'], [2, 2, 3, 3, 3, 3],
      { melon: 63, grapes: 31, plum: 19, orange: 13, lemon: 10, cherry: 8 }, { type: 'pair', pays: 1 }),
    M('bunkier', 'BUNKIER', 'PULA ROŚNIE Z KAŻDEJ STAWKI', C.olive, ['redstar', 'medal', 'helmet', 'grenade', 'radio', 'boots'], [1, 2, 3, 3, 3, 4],
      { redstar: 265, medal: 70, helmet: 36, grenade: 27, radio: 18, boots: 9 }, { type: 'jackpot', symbol: 'redstar', feed: .04 }),
    M('zloto', 'ZŁOTO', 'WYSOKA PULA · ×480 + PULA', C.gold, ['goldbar', 'diamond', 'ring', 'crown', 'coin', 'key'], [1, 1, 2, 3, 4, 5],
      { goldbar: 480, diamond: 195, ring: 73, crown: 29, coin: 12, key: 5 }, { type: 'jackpot', symbol: 'goldbar', feed: .06 })
  ]);
  const byId = new Map(MACHINES.map(m => [m.id, m]));
  const machine = id => byId.get(id) || MACHINES[0];
  // Multiplier for three stopped symbols on a machine, and the rule that paid.
  function evaluate(symbols, m = MACHINES[0]) {
    const b = m.bonus || {}, [a, mid, c] = symbols, count = s => symbols.filter(x => x === s).length;
    if (b.type === 'freespins' && count(b.symbol) === 3) return { multiplier: 0, rule: 'free', symbol: b.symbol, spins: b.spins };
    let res = null;
    if (a === mid && mid === c) res = { multiplier: m.triple[a] || 0, rule: 'triple', symbol: a };
    else if (b.type === 'wild') { const rest = symbols.filter(s => s !== b.symbol); if (rest.length && rest.length < 3 && rest.every(s => s === rest[0])) res = { multiplier: m.triple[rest[0]] || 0, rule: 'wild', symbol: rest[0] }; }
    if (!(res && res.multiplier > 0)) {
      res = null;
      if (b.type === 'scatter') { const n = count(b.symbol); if (b.pays[n]) res = { multiplier: b.pays[n], rule: 'scatter', symbol: b.symbol, count: n }; }
      else if (b.type === 'pair' || b.type === 'multiplier') { const sym = a === mid ? a : mid === c ? mid : a === c ? a : null; if (sym) res = { multiplier: b.pays ?? b.pair, rule: 'pair', symbol: sym }; }
    }
    if (!res || !(res.multiplier > 0)) return { multiplier: 0, rule: null, symbol: null };
    if (b.type === 'jackpot' && res.rule === 'triple' && res.symbol === b.symbol) res.rule = 'jackpot';
    if (b.type === 'multiplier' && mid === b.symbol && res.symbol !== b.symbol) { res.multiplier *= b.times; res.boosted = b.times; }
    return res;
  }
  const potsOf = p => { const out = {}; for (const [id, v] of Object.entries(p?.pots && typeof p.pots === 'object' ? p.pots : {})) if (byId.has(id)) out[id] = { coins: integer(v?.coins), pln: integer(v?.pln) }; return out; };
  const freeOf = p => { const f = p?.free; return f && byId.has(f.machine) && integer(f.left) > 0 && (f.currency === 'coins' || f.currency === 'pln') && integer(f.amount) > 0 ? { machine: f.machine, left: integer(f.left), amount: integer(f.amount), currency: f.currency } : null; };
  const stats = profile => ({ spins: integer(profile.slots?.spins), coinsNet: signed(profile.slots?.coinsNet), plnNet: signed(profile.slots?.plnNet), pending: null, machine: byId.has(profile.slots?.machine) ? profile.slots.machine : MACHINES[0].id, pots: potsOf(profile.slots), free: freeOf(profile.slots) });
  const pot = (profile, id, currency) => integer(profile.slots?.pots?.[id]?.[currency]);
  function canBet(profile, bet = {}) {
    const m = machine(bet.machine), amount = integer(bet.amount), currency = bet.currency, free = freeOf(profile.slots);
    if (profile.slots?.pending) return { ok: false, reason: 'pending' };
    if (free && free.machine !== m.id) return { ok: false, reason: 'free', machine: free.machine };
    if (free) return { ok: true, amount: free.amount, currency: free.currency, free: true };
    if (currency !== 'coins' && currency !== 'pln') return { ok: false, reason: 'currency' };
    if (amount < MIN[currency]) return { ok: false, reason: 'min', min: MIN[currency] };
    if (integer(profile[field(currency)]) < amount) return { ok: false, reason: 'funds' };
    return { ok: true, amount, currency, free: false };
  }
  // Takes the stake (unless a free spin), stops each reel, parks the payout. Null when the bet is not allowed.
  function spin(profile, bet, random = Math.random) {
    const m = machine(bet.machine), check = canBet(profile, { ...bet, machine: m.id }); if (!check.ok) return null;
    const { amount, currency } = check, key = field(currency);
    const stops = [0, 1, 2].map(() => Math.min(m.reel.length - 1, Math.max(0, Math.floor(random() * m.reel.length))));
    const symbols = stops.map(i => m.reel[i]), result = evaluate(symbols, m);
    let payout = amount * result.multiplier;
    const s = stats(profile); s.machine = m.id; s.spins += 1;
    if (m.bonus.type === 'jackpot') {
      const p = s.pots[m.id] || (s.pots[m.id] = { coins: 0, pln: 0 });
      if (!check.free) p[currency] += Math.floor(amount * m.bonus.feed);
      if (result.rule === 'jackpot') { result.pot = p[currency]; payout += p[currency]; p[currency] = 0; }
    }
    if (check.free) { s.free = s.free.left > 1 ? { ...s.free, left: s.free.left - 1 } : null; }
    if (result.rule === 'free') s.free = { machine: m.id, left: result.spins, amount, currency };
    const stake = check.free ? 0 : amount;
    s[currency === 'pln' ? 'plnNet' : 'coinsNet'] += payout - stake;
    s.pending = payout ? { currency, amount: payout } : null;
    const next = { ...profile, [key]: (key === 'balance' ? signed(profile[key]) : integer(profile[key])) - stake, slots: s };
    return { profile: next, machine: m.id, stops, symbols, ...result, win: payout > 0, payout, net: payout - stake, amount, currency, free: check.free, freeLeft: s.free && s.free.machine === m.id ? s.free.left : 0 };
  }
  function settle(profile) {
    const p = profile.slots?.pending; if (!p || !integer(p.amount)) return { ...profile, slots: stats(profile) };
    const key = field(p.currency);   // no upper limit; a PLN debt keeps its sign, so the win pays it down first
    return { ...profile, [key]: (key === 'balance' ? signed(profile[key]) : integer(profile[key])) + integer(p.amount), slots: stats(profile) };
  }
  // Expected return per unit staked: every stop combination, plus expected free spins and the jackpot feed (which comes back as the pot).
  function rtp(m = MACHINES[0]) {
    const n = m.reel.length, total = n * n * n; let base = 0, triggers = 0;
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) { const r = evaluate([m.reel[a], m.reel[b], m.reel[c]], m); if (r.rule === 'free') triggers++; else base += r.multiplier; }
    let ev = base / total;
    if (m.bonus.type === 'freespins') ev += (triggers / total) * m.bonus.spins * (base / total);
    if (m.bonus.type === 'jackpot') ev += m.bonus.feed;
    return ev;
  }
  const first = MACHINES[0];
  window.MuseumSlots = Object.freeze({ MACHINES, machine, MIN, SYMBOLS: first.symbols, REEL: first.reel, TRIPLE: first.triple, KUFEL: first.bonus.pays, evaluate, canBet, spin, settle, stats, pot, rtp, strip });
})();
