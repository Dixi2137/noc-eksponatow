/* Pożyczka Kustosza: quote, taking, installments, the bailiff, debt, repayment, migration. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const L = window.MuseumLoan, loot = window.MuseumLoot, H = 3600000;
  test('Pożyczka: wycena trzyma się zakresów, odsetki zależą od tempa, rata i okres wychodzą z liczby rat', () => {
    const q = L.quote({ currency: 'pln', amount: 10000, installments: 4, perDay: 1 });
    assert.equal(q.total, 12000); assert.equal(q.installment, 3000); assert.equal(q.every, 24 * H); assert.equal(q.interest, 2000);
    assert.equal(L.quote({ currency: 'pln', amount: 10000, installments: 4, perDay: 3 }).total, 11000, 'szybciej = taniej');
    assert.equal(L.quote({ currency: 'pln', amount: 10000, installments: 3, perDay: 2 }).every, 12 * H);
    const clamped = L.quote({ currency: 'coins', amount: 999999, installments: 99, perDay: 7 }); assert.equal(clamped.amount, 50000); assert.equal(clamped.installments, 10); assert.equal(clamped.perDay, 1);
    assert.equal(L.quote({ currency: 'pln', amount: 5, installments: 0 }).amount, 1000, 'minimum 10 zł'); assert.equal(L.quote({ currency: 'pln', amount: 1550 }).amount, 2000, 'krok 10 zł');
  });
  test('Pożyczka: raty schodzą z salda, bez środków komornik bierze najcenniejszy przedmiot, bez przedmiotów rata idzie w debet', () => {
    const t0 = Date.parse('2026-11-02T20:00:00Z');
    let p = loot.migrate({ coins: 500, balance: 2000, owned: ['solar'], skin: 'knight' });
    p = L.take(p, { currency: 'pln', amount: 10000, installments: 4, perDay: 1 }, t0);
    assert.equal(p.balance, 12000); assert.equal(p.loan.total, 12000); assert.equal(p.loan.next, new Date(t0 + 24 * H).toISOString()); assert.equal(p.loans.taken, 1);
    assert.equal(L.take(p, { currency: 'pln', amount: 1000 }, t0), null, 'jedna pożyczka naraz');
    assert.equal(L.dueCount(p, t0 + 23 * H), 0); assert.equal(L.dueCount(p, t0 + 49 * H), 2);
    // Nothing due yet: nothing happens.
    assert.deepEqual(L.collect(p, t0 + 23 * H, loot).events, []);
    // First installment: 30 zł from the balance of 120 zł.
    let r = L.collect(p, t0 + 24 * H, loot); p = r.profile;
    assert.equal(r.events.length, 1); assert.equal(r.events[0].type, 'paid'); assert.equal(p.balance, 9000); assert.equal(p.loan.paid, 3000); assert.equal(L.installmentsLeft(p.loan), 3);
    // Balance spent, next installment due: the legendary skin (4500 → 1800 ✦ → 54 zł) goes to the bailiff and covers more than one installment.
    p = { ...p, balance: 100 };
    r = L.collect(p, t0 + 48 * H, loot); p = r.profile;
    assert.equal(r.events[0].type, 'seized'); assert.equal(r.events[0].item.id, 'solar'); assert.equal(r.events[0].value, 5400);
    assert.ok(!p.owned.includes('solar'), 'skin zabrany'); assert.equal(p.coins, 500, 'bez gotówki ze sprzedaży'); assert.equal(p.balance, 100); assert.equal(p.loan.paid, 8400); assert.equal(p.loans.seized, 1); assert.equal(p.loan.seized[0].name, loot.getItem('solar').name);
    // Two more periods, nothing left to take (the default knight is not for sale): the rest of the loan lands as a debt and the loan closes.
    r = L.collect(p, t0 + 96 * H, loot); p = r.profile;
    assert.equal(r.events.map(e => e.type).join(','), 'debt,debt,closed'); assert.equal(p.loan, null); assert.equal(p.balance, 100 - 3000 - 600, 'rata 30 zł i końcówka 6 zł w debet'); assert.equal(p.loans.repaid, 1); assert.equal(p.lastLoan.seized.length, 1);
  });
  test('Pożyczka w żetonach: spłata ręczna raty i całości, debet z żetonów przelicza się na złotówki', () => {
    const t0 = Date.parse('2026-11-02T20:00:00Z');
    let p = L.take(loot.migrate({ coins: 100, balance: 0 }), { currency: 'coins', amount: 1000, installments: 2, perDay: 2 }, t0);
    assert.equal(p.coins, 1100); assert.equal(p.loan.total, 1150); assert.equal(p.loan.installment, 575);
    let r = L.repay(p, 0, loot); p = r.profile; assert.equal(r.amount, 575); assert.equal(p.coins, 525); assert.ok(!r.closed);
    assert.equal(L.repay({ ...p, coins: 10 }, 0, loot), null, 'za mało na ratę');
    assert.equal(L.repay(p, 999999, loot), null, '525 ✦ nie starcza na resztę 575'); r = L.repay({ ...p, coins: 1000 }, 999999, loot); assert.equal(r.amount, 575); assert.ok(r.closed); assert.equal(r.profile.coins, 425); assert.equal(r.profile.loan, null); assert.equal(r.profile.loans.repaid, 1);
    const broke = L.collect({ ...p, coins: 0 }, t0 + 12 * H, loot); assert.equal(broke.events[0].type, 'debt'); assert.equal(broke.profile.balance, -575 * 3, '575 ✦ × 3 gr');
  });
  test('Pożyczka: migracja profilu zachowuje pożyczkę i statystyki, wyrzuca śmieci', () => {
    const loan = { currency: 'pln', principal: 10000, total: 12000, paid: 3000, installment: 3000, installments: 4, perDay: 1, every: 24 * H, started: '2026-11-02T20:00:00.000Z', next: '2026-11-03T20:00:00.000Z', seized: [{ id: 'solar', name: 'X', kind: 'skin', value: 5400, at: '2026-11-03T20:00:00.000Z' }] };
    const m = loot.migrate({ loan, loans: { taken: 2, repaid: 1, seized: 3 } });
    assert.deepEqual(m.loan, loan); assert.deepEqual(m.loans, { taken: 2, repaid: 1, seized: 3 });
    assert.equal(loot.migrate({ loan: { currency: 'eur', total: 5 } }).loan, null); assert.equal(loot.migrate({ loan: { ...loan, paid: 12000 } }).loan, null, 'spłacona nie wraca');
    assert.deepEqual(loot.migrate(null).loans, { taken: 0, repaid: 0, seized: 0 });
  });
})();
