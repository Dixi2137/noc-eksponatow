/* Rabunek i ochrona: shared numbers, paying for protection, applying the robber's side, messages, migration. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const R = window.MuseumRob, loot = window.MuseumLoot;
  test('Rabunek: łup 8 % do 3000 ✦, kara 10 % do 2000 ✦, cooldown 10 minut', () => {
    assert.equal(R.loot(1000), 80); assert.equal(R.loot(100000), 3000); assert.equal(R.loot(-5), 0);
    assert.equal(R.penalty(1000), 100); assert.equal(R.penalty(50000), 2000);
    assert.equal(R.COOLDOWN_MS, 600000); assert.ok(R.SUCCESS > .5 && R.SUCCESS < .7);
    assert.equal(R.cooldownLeft(new Date(Date.now() + 60000).toISOString()) > 59000, true); assert.equal(R.cooldownLeft(null), 0);
  });
  test('Ochrona: dwa progi, płatność żetonami albo saldem, przedłużanie od końca obecnej ochrony', () => {
    const now = Date.parse('2026-11-05T12:00:00Z');
    let p = { ...loot.migrate(null), coins: 1000, balance: 1000 };
    assert.ok(R.canAfford(p, 24, 'coins')); assert.ok(!R.canAfford(p, 168, 'coins')); assert.ok(R.canAfford(p, 24, 'pln')); assert.ok(!R.canAfford(p, 99, 'coins'));
    p = R.pay(p, 24, 'coins', now); assert.equal(p.coins, 600); assert.equal(p.protectedUntil, '2026-11-06T12:00:00.000Z'); assert.ok(R.isProtected(p, now)); assert.ok(!R.isProtected(p, now + 25 * 3600000));
    p = R.pay(p, 24, 'pln', now + 3600000); assert.equal(p.balance, 601); assert.equal(p.protectedUntil, '2026-11-07T12:00:00.000Z', 'doliczone od końca, nie od teraz');
    assert.equal(R.pay({ ...p, coins: 10 }, 24, 'coins', now), null);
    assert.equal(loot.migrate(p).protectedUntil, '2026-11-07T12:00:00.000Z'); assert.equal(loot.migrate({ protectedUntil: 'nie-data' }).protectedUntil, null); assert.equal(loot.migrate({ robSeen: '2026-11-05T10:00:00.000Z' }).robSeen, '2026-11-05T10:00:00.000Z');
  });
  test('Rabunek: strona napastnika i komunikaty dla obu stron', () => {
    const p = { ...loot.migrate(null), coins: 500 };
    assert.equal(R.apply(p, { outcome: 'success', amount: 240 }).coins, 740); assert.equal(R.apply(p, { outcome: 'protected', amount: 900 }).coins, 0); assert.equal(R.apply(p, { outcome: 'failed', amount: 0 }).coins, 500);
    const r = { outcome: 'success', amount: 240, victim: 'Ola', robber: 'Dixi' };
    assert.ok(R.describe(r, 'robber').includes('Ola') && R.describe(r, 'robber').includes('240 ✦')); assert.ok(R.describe(r, 'victim').startsWith('NAPAD!') && R.describe(r, 'victim').includes('Dixi'));
    assert.ok(R.describe({ ...r, outcome: 'protected' }, 'victim').includes('Ochrona zadziałała')); assert.ok(R.describe({ ...r, outcome: 'failed', amount: 0 }, 'robber').includes('spłoszył'));
  });
})();
