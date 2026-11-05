/* Automaty Kustosza: sixteen machines, paytables and bonus rules, parked winnings, free spins, jackpot pots, return to player, migration. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const S = window.MuseumSlots, loot = window.MuseumLoot;
  // rng that lands reel i on the first stop holding symbol syms[i] of a machine.
  const land = (m, syms) => { let i = 0; return () => (m.reel.indexOf(syms[i++ % 3]) + .5) / m.reel.length; };
  test('Automaty: klasyk ma 3 bębny po 16 pól, trójka płaci wg symbolu, kufel płaci sam, wygrana parkuje się do settle', () => {
    assert.equal(S.REEL.length, 16); assert.equal(S.REEL.filter(s => s === 'kufel').length, 1); assert.equal(S.REEL.filter(s => s === 'coin').length, 4);
    assert.equal(S.evaluate(['kufel', 'kufel', 'kufel']).multiplier, 100); assert.equal(S.evaluate(['coin', 'coin', 'coin']).multiplier, 6);
    assert.equal(S.evaluate(['kufel', 'sword', 'kufel']).multiplier, 8); assert.equal(S.evaluate(['sword', 'kufel', 'coin']).multiplier, 2); assert.equal(S.evaluate(['sword', 'skull', 'coin']).multiplier, 0);
    const r = S.rtp(); assert.ok(r >= .88 && r <= .95, `zwrot ${Math.round(r * 1000) / 10} %`);
    const p = { ...loot.migrate(null), coins: 1000, balance: 5000 };
    assert.equal(S.canBet(p, { amount: 5, currency: 'coins' }).reason, 'min'); assert.equal(S.canBet(p, { amount: 2000, currency: 'coins' }).reason, 'funds'); assert.ok(S.canBet(p, { amount: 1000, currency: 'coins' }).ok, 'bez górnego limitu');
    const jackpot = S.spin(p, { amount: 100, currency: 'coins' }, () => 0);
    assert.deepEqual(jackpot.symbols, ['kufel', 'kufel', 'kufel']); assert.equal(jackpot.payout, 10000); assert.equal(jackpot.profile.coins, 900); assert.deepEqual(jackpot.profile.slots.pending, { currency: 'coins', amount: 10000 }); assert.equal(jackpot.profile.slots.machine, 'kufel');
    assert.equal(S.canBet(jackpot.profile, { amount: 100, currency: 'coins' }).reason, 'pending');
    assert.equal(S.settle({ ...p, balance: 150000000, slots: { pending: { currency: 'pln', amount: 300000000 } } }).balance, 450000000, 'wygrana w zł bez górnego limitu');
    assert.equal(S.settle({ ...p, balance: -2000, slots: { pending: { currency: 'pln', amount: 500 } } }).balance, -1500, 'wygrana spłaca debet'); assert.equal(S.canBet({ ...p, balance: -2000 }, { amount: 100, currency: 'pln' }).reason, 'funds');
    const settled = S.settle(jackpot.profile); assert.equal(settled.coins, 10900); assert.equal(settled.slots.pending, null); assert.equal(settled.slots.coinsNet, 9900); assert.equal(settled.slots.spins, 1);
    let i = 0; const lose = S.spin(settled, { amount: 100, currency: 'pln' }, () => [1, 2, 3][i++ % 3] / 16);
    assert.deepEqual(lose.symbols, ['coin', 'sword', 'pumpkin']); assert.equal(lose.payout, 0); assert.equal(lose.profile.balance, 4900); assert.equal(lose.profile.slots.pending, null); assert.equal(lose.profile.slots.plnNet, -100);
  });
  test('Automaty: 16 maszyn, każda z 6 symbolami na 16 polach i zwrotem 86–95 %', () => {
    assert.equal(S.MACHINES.length, 16); assert.equal(new Set(S.MACHINES.map(m => m.id)).size, 16);
    const kinds = new Set();
    for (const m of S.MACHINES) {
      assert.equal(m.symbols.length, 6, m.id); assert.equal(m.reel.length, 16, m.id); assert.equal(new Set(m.reel).size, 6, `${m.id}: każdy symbol na bębnie`);
      for (const s of Object.keys(m.triple)) assert.ok(m.reel.includes(s), `${m.id}: ${s} w tabeli, ale nie na bębnie`);
      assert.ok(window.MuseumSlotsArt.sprite(m.symbols[0]).rows.length === 16, `${m.id}: sprite`);
      const r = S.rtp(m); assert.ok(r >= .86 && r <= .95, `${m.id}: zwrot ${Math.round(r * 1000) / 10} %`); kinds.add(m.bonus.type);
    }
    assert.deepEqual([...kinds].sort(), ['freespins', 'jackpot', 'multiplier', 'none', 'pair', 'scatter', 'wild']);
    assert.equal(S.machine('nie-ma').id, 'kufel', 'nieznana maszyna = klasyk');
    const st = S.strip(['a', 'b'], [1, 3]); assert.equal(st.length, 4); assert.equal(st.filter(x => x === 'a').length, 1); assert.equal(S.strip(['a', 'b'], [2, 2]).join(''), 'abab', 'symbole przeplatane');
  });
  test('Automaty: dziki symbol, pary, mnożnik na środku, scatter', () => {
    const krypta = S.machine('krypta'), tron = S.machine('tron'), piraci = S.machine('piraci'), dino = S.machine('dino');
    assert.equal(S.evaluate(['ghost', 'skull', 'skull'], krypta).multiplier, 30); assert.equal(S.evaluate(['ghost', 'skull', 'skull'], krypta).rule, 'wild');
    assert.equal(S.evaluate(['skull', 'ghost', 'ghost'], krypta).multiplier, 30); assert.equal(S.evaluate(['ghost', 'ghost', 'ghost'], krypta).multiplier, 65); assert.equal(S.evaluate(['ghost', 'skull', 'bat'], krypta).multiplier, 0);
    assert.equal(S.evaluate(['bar', 'bar', 'seven'], S.machine('siodemki')).rule, 'pair'); assert.equal(S.evaluate(['bar', 'seven', 'bar'], S.machine('siodemki')).multiplier, 1); assert.equal(S.evaluate(['bar', 'seven', 'bell'], S.machine('siodemki')).multiplier, 0);
    const boosted = S.evaluate(['shield', 'ring', 'shield'], tron); assert.equal(boosted.multiplier, 2); assert.equal(boosted.boosted, 2);
    assert.equal(S.evaluate(['shield', 'shield', 'ring'], tron).multiplier, 1, 'pierścień poza środkiem nie mnoży'); assert.equal(S.evaluate(['ring', 'ring', 'ring'], tron).multiplier, 9, 'trójka pierścieni bez mnożnika');
    assert.equal(S.evaluate(['rum', 'parrot', 'rum'], piraci).multiplier, 3);
    assert.equal(S.evaluate(['meteor', 'trex', 'egg'], dino).multiplier, 1); assert.equal(S.evaluate(['meteor', 'trex', 'meteor'], dino).multiplier, 10); assert.equal(S.evaluate(['meteor', 'meteor', 'meteor'], dino).multiplier, 170);
  });
  test('Automaty: trzy chmiele dają darmowe obroty bez stawki, tylko na tej maszynie', () => {
    const m = S.machine('browar'); let p = { ...loot.migrate(null), coins: 1000 };
    let r = S.spin(p, { amount: 100, currency: 'coins', machine: 'browar' }, land(m, ['hops', 'hops', 'hops'])); p = r.profile;
    assert.equal(r.rule, 'free'); assert.equal(r.spins, 5); assert.equal(r.payout, 0); assert.equal(p.coins, 900); assert.deepEqual(p.slots.free, { machine: 'browar', left: 5, amount: 100, currency: 'coins' });
    assert.equal(S.canBet(p, { amount: 100, currency: 'coins', machine: 'kufel' }).reason, 'free', 'inna maszyna czeka');
    const c = S.canBet(p, { amount: 5, currency: 'pln', machine: 'browar' }); assert.ok(c.ok && c.free && c.amount === 100 && c.currency === 'coins', 'darmowy obrót ignoruje wpisaną stawkę');
    r = S.spin(p, { machine: 'browar' }, land(m, ['kufel', 'kufel', 'kufel'])); p = S.settle(r.profile);
    assert.ok(r.free); assert.equal(r.amount, 100); assert.equal(r.payout, 24000); assert.equal(r.freeLeft, 4); assert.equal(p.coins, 900 + 24000, 'stawka nie zeszła'); assert.equal(p.slots.free.left, 4); assert.equal(p.slots.coinsNet, 24000 - 100);
    for (let i = 0; i < 4; i++) { r = S.spin(p, { machine: 'browar' }, land(m, ['barrel', 'cross', 'bottle'])); p = r.profile; }
    assert.equal(p.slots.free, null, 'po pięciu darmowych koniec'); assert.equal(p.slots.spins, 6);
    assert.equal(S.rtp(m) > S.rtp({ ...m, bonus: { type: 'none' } }), true, 'darmowe obroty podnoszą zwrot');
  });
  test('Automaty: pula rośnie z każdej stawki i wypada przy trzech sztabkach', () => {
    const m = S.machine('zloto'); let p = { ...loot.migrate(null), coins: 10000, balance: 10000 };
    let r = S.spin(p, { amount: 1000, currency: 'coins', machine: 'zloto' }, land(m, ['coin', 'key', 'ring'])); p = r.profile;
    assert.equal(S.pot(p, 'zloto', 'coins'), 60); assert.equal(S.pot(p, 'zloto', 'pln'), 0);
    r = S.spin(p, { amount: 1000, currency: 'pln', machine: 'zloto' }, land(m, ['coin', 'key', 'ring'])); p = r.profile; assert.equal(S.pot(p, 'zloto', 'pln'), 60); assert.equal(S.pot(p, 'zloto', 'coins'), 60);
    r = S.spin(p, { amount: 1000, currency: 'coins', machine: 'zloto' }, land(m, ['goldbar', 'goldbar', 'goldbar'])); p = r.profile;
    assert.equal(r.rule, 'jackpot'); assert.equal(r.pot, 120); assert.equal(r.payout, 1000 * 480 + 120); assert.equal(S.pot(p, 'zloto', 'coins'), 0, 'pula wyzerowana'); assert.equal(S.pot(p, 'zloto', 'pln'), 60, 'pula w zł nietknięta');
    assert.equal(S.pot(S.spin(S.settle(p), { amount: 100, currency: 'coins', machine: 'kufel' }, () => .5).profile, 'zloto', 'pln'), 60, 'inna maszyna nie rusza puli');
  });
  test('Automaty: migracja profilu zachowuje statystyki, maszynę, pule i darmowe obroty', () => {
    const m = loot.migrate({ slots: { spins: 3, coinsNet: -40, plnNet: 900, pending: { currency: 'coins', amount: 800 }, machine: 'zloto', pots: { zloto: { coins: 120, pln: 60 }, 'Bad id!': { coins: 5 } }, free: { machine: 'browar', left: 2, amount: 100, currency: 'coins' } } });
    assert.deepEqual(m.slots, { spins: 3, coinsNet: -40, plnNet: 900, pending: { currency: 'coins', amount: 800 }, machine: 'zloto', pots: { zloto: { coins: 120, pln: 60 } }, free: { machine: 'browar', left: 2, amount: 100, currency: 'coins' } });
    assert.deepEqual(loot.migrate(null).slots, { spins: 0, coinsNet: 0, plnNet: 0, pending: null, machine: 'kufel', pots: {}, free: null });
    assert.equal(loot.migrate({ slots: { free: { machine: 'browar', left: 0, amount: 100, currency: 'coins' } } }).slots.free, null, 'zero obrotów = brak');
  });
})();
