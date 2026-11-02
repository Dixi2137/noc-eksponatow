/* Automaty Kustosza: paytable, reels, parked winnings, return to player, profile migration. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const S = window.MuseumSlots, loot = window.MuseumLoot;
  test('Automaty: 3 bębny po 16 pól, trójka płaci wg symbolu, kufel płaci sam, zwrot dla gracza 88–95 %', () => {
    assert.equal(S.REEL.length, 16); assert.equal(S.REEL.filter(s => s === 'kufel').length, 1); assert.equal(S.REEL.filter(s => s === 'coin').length, 4);
    assert.equal(S.evaluate(['kufel', 'kufel', 'kufel']).multiplier, 100); assert.equal(S.evaluate(['coin', 'coin', 'coin']).multiplier, 6);
    assert.equal(S.evaluate(['kufel', 'sword', 'kufel']).multiplier, 8); assert.equal(S.evaluate(['sword', 'kufel', 'coin']).multiplier, 2); assert.equal(S.evaluate(['sword', 'skull', 'coin']).multiplier, 0);
    const r = S.rtp(); assert.ok(r >= .88 && r <= .95, `zwrot ${Math.round(r * 1000) / 10} %`);
    const p = { ...loot.migrate(null), coins: 1000, balance: 5000 };
    assert.equal(S.canBet(p, { amount: 5, currency: 'coins' }).reason, 'min'); assert.equal(S.canBet(p, { amount: 2000, currency: 'coins' }).reason, 'funds'); assert.ok(S.canBet(p, { amount: 1000, currency: 'coins' }).ok, 'bez górnego limitu');
    // rng 0 → every reel stops on 0 = kufel: ×100 parked, stake gone at once.
    const jackpot = S.spin(p, { amount: 100, currency: 'coins' }, () => 0);
    assert.deepEqual(jackpot.symbols, ['kufel', 'kufel', 'kufel']); assert.equal(jackpot.payout, 10000); assert.equal(jackpot.profile.coins, 900); assert.deepEqual(jackpot.profile.slots.pending, { currency: 'coins', amount: 10000 });
    assert.equal(S.canBet(jackpot.profile, { amount: 100, currency: 'coins' }).reason, 'pending');
    assert.equal(S.settle({ ...p, balance: 150000000, slots: { pending: { currency: 'pln', amount: 300000000 } } }).balance, 450000000, 'wygrana w zł bez górnego limitu');
    assert.equal(S.settle({ ...p, balance: -2000, slots: { pending: { currency: 'pln', amount: 500 } } }).balance, -1500, 'wygrana spłaca debet'); assert.equal(S.canBet({ ...p, balance: -2000 }, { amount: 100, currency: 'pln' }).reason, 'funds');
    const settled = S.settle(jackpot.profile); assert.equal(settled.coins, 10900); assert.equal(settled.slots.pending, null); assert.equal(settled.slots.coinsNet, 9900); assert.equal(settled.slots.spins, 1);
    // rng cycling 1/16, 2/16, 3/16 → coin, sword, pumpkin: nothing, nothing pending, PLN stake gone.
    let i = 0; const lose = S.spin(settled, { amount: 100, currency: 'pln' }, () => [1, 2, 3][i++ % 3] / 16);
    assert.deepEqual(lose.symbols, ['coin', 'sword', 'pumpkin']); assert.equal(lose.payout, 0); assert.equal(lose.profile.balance, 4900); assert.equal(lose.profile.slots.pending, null); assert.equal(lose.profile.slots.plnNet, -100);
  });
  test('Automaty: migracja profilu zachowuje statystyki ze znakiem i zaparkowaną wygraną', () => {
    assert.deepEqual(loot.migrate({ slots: { spins: 3, coinsNet: -40, plnNet: 900, pending: { currency: 'coins', amount: 800 } } }).slots, { spins: 3, coinsNet: -40, plnNet: 900, pending: { currency: 'coins', amount: 800 } });
    assert.deepEqual(loot.migrate(null).slots, { spins: 0, coinsNet: 0, plnNet: 0, pending: null });
  });
})();
