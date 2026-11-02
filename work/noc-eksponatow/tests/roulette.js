/* Ruletka Kustosza: stakes, payouts, parked winnings, profile migration. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const R = window.MuseumRoulette, loot = window.MuseumLoot;
  test('Ruletka: 15 pól, zakład tylko w granicach i za posiadane środki, wygrana ×2 / ×14 ląduje jako pending i wchodzi po settle', () => {
    assert.equal(R.WHEEL.length, 15); assert.equal(R.WHEEL.filter(c => c === 'green').length, 1); assert.equal(R.WHEEL.filter(c => c === 'red').length, 7);
    const p = { ...loot.migrate(null), coins: 1000, balance: 5000 };
    assert.equal(R.canBet(p, { color: 'red', amount: 5, currency: 'coins' }).reason, 'min');
    assert.equal(R.canBet(p, { color: 'red', amount: 2000, currency: 'coins' }).reason, 'funds');
    assert.equal(R.canBet(p, { color: 'blue', amount: 100, currency: 'coins' }).reason, 'color');
    assert.equal(R.canBet(p, { color: 'red', amount: 100, currency: 'eur' }).reason, 'currency');
    assert.ok(R.canBet(p, { color: 'green', amount: 100, currency: 'pln' }).ok);
    // rng .1 → index 1 = red; the stake leaves at once, the payout waits in pending.
    const win = R.spin(p, { color: 'red', amount: 100, currency: 'coins' }, () => .1);
    assert.equal(win.color, 'red'); assert.ok(win.win); assert.equal(win.payout, 200); assert.equal(win.profile.coins, 900); assert.deepEqual(win.profile.roulette.pending, { currency: 'coins', amount: 200 });
    assert.equal(R.canBet(win.profile, { color: 'red', amount: 100, currency: 'coins' }).reason, 'pending', 'bez settle nie ma kolejnego zakładu');
    const settled = R.settle(win.profile); assert.equal(settled.coins, 1100); assert.equal(settled.roulette.pending, null); assert.equal(settled.roulette.spins, 1); assert.equal(settled.roulette.coinsNet, 100);
    // rng 0 → index 0 = green, ×14 from the PLN balance.
    const green = R.spin(settled, { color: 'green', amount: 100, currency: 'pln' }, () => 0);
    assert.equal(green.color, 'green'); assert.equal(green.payout, 1400); assert.equal(green.profile.balance, 4900); assert.equal(R.settle(green.profile).balance, 6300);
    assert.equal(R.settle({ ...settled, balance: 99999900, roulette: { pending: { currency: 'pln', amount: 1400 } } }).balance, 100001300, 'saldo przechodzi przez milion zł');
    assert.equal(R.settle({ ...settled, balance: -700, roulette: { pending: { currency: 'pln', amount: 200 } } }).balance, -500, 'wygrana w zł schodzi z debetu'); assert.equal(R.canBet({ ...settled, balance: -700 }, { color: 'red', amount: 100, currency: 'pln' }).reason, 'funds');
    // rng .99 → index 14 = black: a red bet loses, nothing pending, settle is a no-op.
    const lose = R.spin(settled, { color: 'red', amount: 300, currency: 'coins' }, () => .99);
    assert.equal(lose.color, 'black'); assert.ok(!lose.win); assert.equal(lose.profile.coins, 800); assert.equal(lose.profile.roulette.pending, null); assert.equal(R.settle(lose.profile).coins, 800); assert.equal(lose.profile.roulette.coinsNet, -200);
    assert.equal(R.spin(p, { color: 'red', amount: 5, currency: 'coins' }), null, 'zakład poniżej minimum odrzucony');
  });
  test('Ruletka: migracja profilu zachowuje statystyki ze znakiem i zaparkowaną wygraną', () => {
    const m = loot.migrate({ roulette: { spins: 7, coinsNet: -450, plnNet: 1300, pending: { currency: 'pln', amount: 1400 } } });
    assert.deepEqual(m.roulette, { spins: 7, coinsNet: -450, plnNet: 1300, pending: { currency: 'pln', amount: 1400 } });
    assert.deepEqual(loot.migrate(null).roulette, { spins: 0, coinsNet: 0, plnNet: 0, pending: null });
    assert.equal(loot.migrate({ roulette: { pending: { currency: 'eur', amount: 5 } } }).roulette.pending, null, 'śmieci w pending wylatują');
  });
})();
