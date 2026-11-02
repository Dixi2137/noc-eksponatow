/* Pożyczka Kustosza: one loan at a time, in tokens or PLN (grosze). The player picks the amount, the number of
   installments and the pace (1, 2 or 3 installments a day); interest depends on the pace. Installments fall due on a
   schedule and are taken from the funds. When the funds are short, the bailiff ("komornik") takes the most valuable
   sellable item from the collection and credits its buy-back price against the loan; when nothing is left to take, the
   installment lands on the PLN balance as a debt. Everything here is pure: the UI passes the profile in and stores
   what comes back. */
(() => {
  'use strict';
  const DAY = 86400000;
  const LIMITS = Object.freeze({ coins: { min: 100, max: 50000, step: 100 }, pln: { min: 1000, max: 100000, step: 1000 } });   // pln in grosze (10–1000 zł)
  const INSTALLMENTS = Object.freeze({ min: 2, max: 10 });
  const PER_DAY = Object.freeze([1, 2, 3]);
  const RATE = Object.freeze({ 1: .2, 2: .15, 3: .1 });   // interest on the whole loan: the faster you pay, the cheaper
  const EXCHANGE = 3;                                       // grosze per token when a token-priced item covers a PLN loan (and back)
  const integer = v => Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : 0;
  const signed = v => Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : 0;
  const field = currency => currency === 'pln' ? 'balance' : 'coins';
  const funds = (profile, currency) => currency === 'pln' ? signed(profile.balance) : integer(profile.coins);
  const iso = ms => new Date(ms).toISOString();
  const stats = profile => ({ taken: integer(profile.loans?.taken), repaid: integer(profile.loans?.repaid), seized: integer(profile.loans?.seized) });
  // Clamps the request to the allowed ranges and prices it.
  function quote(params = {}) {
    const currency = params.currency === 'pln' ? 'pln' : 'coins', lim = LIMITS[currency];
    const amount = Math.min(lim.max, Math.max(lim.min, Math.round(integer(params.amount) / lim.step) * lim.step));
    const installments = Math.min(INSTALLMENTS.max, Math.max(INSTALLMENTS.min, integer(params.installments) || INSTALLMENTS.min));
    const perDay = PER_DAY.includes(Number(params.perDay)) ? Number(params.perDay) : 1, rate = RATE[perDay];
    const total = Math.ceil(amount * (1 + rate)), installment = Math.ceil(total / installments), every = Math.round(DAY / perDay);
    return { currency, amount, installments, perDay, rate, interest: total - amount, total, installment, every };
  }
  function canTake(profile) { return profile.loan ? { ok: false, reason: 'active' } : { ok: true }; }
  // Credits the amount and opens the loan; the first installment falls due after one period.
  function take(profile, params, now = Date.now()) {
    if (!canTake(profile).ok) return null;
    const q = quote(params), key = field(q.currency);
    const loan = { currency: q.currency, principal: q.amount, total: q.total, paid: 0, installment: q.installment, installments: q.installments, perDay: q.perDay, every: q.every, started: iso(now), next: iso(now + q.every), seized: [] };
    const s = stats(profile); s.taken += 1;
    return { ...profile, [key]: funds(profile, q.currency) + q.amount, loan, loans: s };
  }
  const remaining = loan => loan ? Math.max(0, integer(loan.total) - integer(loan.paid)) : 0;
  const installmentsLeft = loan => loan ? Math.ceil(remaining(loan) / Math.max(1, integer(loan.installment))) : 0;
  function dueCount(profile, now = Date.now()) {
    const loan = profile.loan; if (!loan) return 0; const next = Date.parse(loan.next); if (!Number.isFinite(next) || next > now) return 0;
    return Math.min(installmentsLeft(loan), Math.floor((now - next) / Math.max(1, integer(loan.every))) + 1);
  }
  // Value of a collection item in the loan's currency (buy-back prices, like selling it yourself).
  function valueIn(item, currency, loot) {
    if (item.kind === 'finish') { const gr = loot.sellPricePLN(item); return currency === 'pln' ? gr : Math.floor(gr / EXCHANGE); }
    const tokens = loot.sellPrice(item); return currency === 'pln' ? tokens * EXCHANGE : tokens;
  }
  // The bailiff's pick: the most valuable item the player could sell (not equipped, not a gift). Null when there is nothing.
  function victim(profile, currency, loot = window.MuseumLoot) {
    const ids = [...(profile.owned || []), ...(profile.weapons || []), ...(profile.cards || []), ...(profile.finishes || [])];
    let best = null;
    for (const id of ids) { if (!loot.canSell(profile, id)) continue; const item = loot.getItem(id), value = valueIn(item, currency, loot); if (value > 0 && (!best || value > best.value)) best = { item, value }; }
    return best;
  }
  function seize(profile, pick, loot = window.MuseumLoot) {
    const { item } = pick;
    if (item.kind === 'finish') { const r = loot.sellFinish(profile, item.id); return { ...r.profile, balance: signed(r.profile.balance) - r.price }; }   // removed, without the cash
    const r = loot.sell(profile, item.id); return { ...r.profile, coins: integer(r.profile.coins) - r.price };
  }
  function close(profile, loan) { const s = stats(profile); s.repaid += 1; return { ...profile, loan: null, loans: s, lastLoan: { ...loan, closed: iso(Date.now()) } }; }
  // Collects every installment that has fallen due. Events describe what happened, for the UI to tell the player.
  function collect(profile, now = Date.now(), loot = window.MuseumLoot) {
    let p = profile; const events = [];
    for (let guard = 0; guard < 400 && p.loan && Date.parse(p.loan.next) <= now; guard++) {
      const loan = { ...p.loan, seized: [...(p.loan.seized || [])] }, key = field(loan.currency), owe = Math.min(integer(loan.installment), remaining(loan)), have = funds(p, loan.currency);
      if (have >= owe) { p = { ...p, [key]: have - owe }; loan.paid += owe; events.push({ type: 'paid', amount: owe, currency: loan.currency }); }
      else {
        const pick = victim(p, loan.currency, loot);
        if (pick) {
          p = seize(p, pick, loot); loan.paid += pick.value; const s = stats(p); s.seized += 1; p = { ...p, loans: s };
          loan.seized.push({ id: pick.item.id, name: pick.item.name, kind: pick.item.kind, value: pick.value, at: iso(Date.parse(loan.next)) });
          events.push({ type: 'seized', item: pick.item, value: pick.value, currency: loan.currency });
        } else {
          const debt = loan.currency === 'pln' ? owe : owe * EXCHANGE;   // a token loan with nothing left to take becomes a PLN debt
          p = { ...p, balance: signed(p.balance) - debt }; loan.paid += owe; events.push({ type: 'debt', amount: debt, currency: 'pln' });
        }
      }
      loan.next = iso(Date.parse(loan.next) + Math.max(1, integer(loan.every)));
      p = { ...p, loan };
      if (remaining(loan) <= 0) { p = close(p, loan); events.push({ type: 'closed', seized: loan.seized.length }); }
    }
    return { profile: p, events };
  }
  // Voluntary payment of up to `amount` (defaults to one installment); null when there is no loan or the funds are short.
  function repay(profile, amount, loot = window.MuseumLoot) {
    const loan = profile.loan; if (!loan) return null;
    const owe = Math.min(remaining(loan), integer(amount) || integer(loan.installment)), have = funds(profile, loan.currency);
    if (!owe || have < owe) return null;
    const next = { ...loan, paid: integer(loan.paid) + owe };
    let p = { ...profile, [field(loan.currency)]: have - owe, loan: next };
    if (remaining(next) <= 0) p = close(p, next);
    return { profile: p, amount: owe, closed: !p.loan };
  }
  window.MuseumLoan = Object.freeze({ DAY, LIMITS, INSTALLMENTS, PER_DAY, RATE, EXCHANGE, quote, canTake, take, remaining, installmentsLeft, dueCount, victim, collect, repay, stats });
})();
