/* Rabunek i ochrona: shared numbers, chance by share, the subscription, applying the robber's side, messages, migration. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const R = window.MuseumRob, loot = window.MuseumLoot;
  test('Rabunek: łup do 25 % majątku ofiary, szansa 90 % do 5 % udziału i 60 % przy 25 %, kara do 20 % własnego konta', () => {
    assert.equal(R.maxLoot(1000), 250); assert.equal(R.maxLoot(-5), 0); assert.deepEqual(R.MIN, { coins: 10, pln: 100 });
    assert.equal(R.chance(.01), .9); assert.equal(R.chance(.05), .9); assert.equal(Math.round(R.chance(.15) * 100), 75); assert.equal(Math.round(R.chance(.25) * 100), 60); assert.equal(R.chance(.9), .6);
    assert.equal(R.penalty(1000, 500), 200); assert.equal(R.penalty(1000, 150), 150);
    assert.equal(R.COOLDOWN_MS, 600000);
    assert.equal(R.cooldownLeft(new Date(Date.now() + 60000).toISOString()) > 59000, true); assert.equal(R.cooldownLeft(null), 0);
  });
  test('Ochrona: abonament 10 000 ✦ albo 20 000 zł dziennie, status z opłaconego dnia albo jednorazowego stempla', () => {
    const now = Date.parse('2026-11-05T12:00:00Z');
    assert.deepEqual(R.SHIELD, { coins: 10000, pln: 2000000 });
    let p = { ...loot.migrate(null), coins: 10000, balance: 1999999 };
    assert.ok(R.canAfford(p, 'coins')); assert.ok(!R.canAfford(p, 'pln')); assert.ok(!R.canAfford({ ...p, coins: 9999 }, 'coins'));
    assert.ok(!R.isProtected(p, now)); assert.ok(!R.subscribed(p));
    p = loot.migrate({ ...p, shield: { currency: 'coins', paidUntil: '2026-11-06T12:00:00.000Z', days: 3 } });
    assert.deepEqual(p.shield, { currency: 'coins', paidUntil: '2026-11-06T12:00:00.000Z', days: 3 }); assert.ok(R.subscribed(p)); assert.ok(R.isProtected(p, now)); assert.ok(!R.isProtected(p, now + 25 * 3600000));
    assert.equal(R.protectedUntil({ protectedUntil: '2026-11-07T12:00:00.000Z', shield: p.shield }, now), Date.parse('2026-11-07T12:00:00Z'), 'późniejszy z dwóch');
    assert.equal(loot.migrate({ shield: { currency: 'eur', paidUntil: '2026-11-06T12:00:00.000Z' } }).shield, null); assert.equal(loot.migrate({ protectedUntil: 'nie-data' }).protectedUntil, null); assert.equal(loot.migrate({ robSeen: '2026-11-05T10:00:00.000Z' }).robSeen, '2026-11-05T10:00:00.000Z');
  });
  test('Rabunek: strona napastnika w obu walutach i komunikaty dla obu stron', () => {
    const p = { ...loot.migrate(null), coins: 500, balance: 300 };
    assert.equal(R.apply(p, { outcome: 'success', amount: 240, currency: 'coins' }).coins, 740); assert.equal(R.apply(p, { outcome: 'protected', amount: 900, currency: 'coins' }).coins, 0); assert.equal(R.apply(p, { outcome: 'failed', amount: 0, currency: 'coins' }).coins, 500);
    assert.equal(R.apply(p, { outcome: 'success', amount: 1000, currency: 'pln' }).balance, 1300); assert.equal(R.apply(p, { outcome: 'protected', amount: 500, currency: 'pln' }).balance, -200, 'kara w zł może zejść w debet');
    const r = { outcome: 'success', amount: 240, victim: 'Ola', robber: 'Dixi', currency: 'coins' };
    assert.ok(R.describe(r, 'robber').includes('Ola') && R.describe(r, 'robber').includes('240 ✦')); assert.ok(R.describe(r, 'victim').startsWith('NAPAD!') && R.describe(r, 'victim').includes('Dixi'));
    assert.ok(R.describe({ ...r, currency: 'pln', amount: 1250 }, 'victim').includes('12,50'));
    assert.ok(R.describe({ ...r, outcome: 'protected' }, 'victim').includes('Ochrona zadziałała')); assert.ok(R.describe({ ...r, outcome: 'failed', amount: 0 }, 'robber').includes('spłoszył'));
  });
})();
