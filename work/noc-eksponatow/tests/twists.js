/* Hall twists and boss specials: data integrity and the engine hooks. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const levels = window.MuseumLevels, twists = window.MuseumTwists, g = window.MuseumGame, t = g._test;
  const start = o => g.start({ skin: 'brass', exhibit: 'leonidas', weapon: 'sword', theme: 'sparta', rng: () => .1, ...o });
  test('Warunki sal: pierwsze trzy sale bez warunku, potem cykl z cichymi salami, każdy warunek istnieje, nagroda +20 %', () => {
    const all = levels.all(); assert.equal(twists.count, 9);
    for (const level of all.slice(0, 3)) assert.equal(level.twist, null, level.id);
    const twisted = all.filter(l => l.twist); assert.ok(twisted.length >= 20, `sal z warunkiem: ${twisted.length}`);
    for (const level of twisted) { assert.ok(twists.get(level.twist), `${level.id}: ${level.twist}`); assert.equal(level.reward, Math.round((120 + (level.number - 1) * 15) * 1.2)); }
    assert.ok(all.some(l => l.number > 3 && !l.twist), 'są też ciche sale po trzeciej');
    const last = all[all.length - 1]; assert.equal(last.id, 'hell'); assert.equal(last.twist, 'second-wind', 'finał ma własny warunek'); assert.equal(last.exhibit, 'beelzebub'); assert.equal(levels.count, 47);
    for (let i = 1; i < all.length; i++) if (all[i].twist) assert.ok(all[i].twist !== all[i - 1].twist, 'dwie sale z rzędu nie mają tego samego warunku');
  });
  test('Szał skraca zamach i odpoczynek, Maraton dodaje HP, warunek jest w zrzucie stanu', () => {
    const base = start({}); const s = start({ twist: 'frenzy' });
    assert.ok(s.combat.windup < base.combat.windup && s.combat.recovery < base.combat.recovery); assert.equal(s.twist.name, 'SZAŁ'); assert.equal(base.twist, null);
    const m = start({ twist: 'marathon' }); assert.equal(m.foe.maxHP, Math.round(base.foe.maxHP * 1.4));
  });
  test('Zasadzka: przeciwnik startuje blisko i zamachuje się od razu', () => {
    const s = start({ twist: 'ambush' }); assert.ok(s.foe.x < 800); const after = t.step(.6); assert.equal(after.foe.state, 'windup'); assert.equal(after.foe.cycle, 1);
  });
  test('Drugi oddech: przy 35 % HP boss leczy się o 25 % i przyspiesza, tylko raz', () => {
    start({ twist: 'second-wind' }); const max = t.setState({}).foe.maxHP; const w0 = t.setState({}).combat.windup;
    t.setState({ foe: { hp: Math.floor(max * .3) } }); const s = t.step(.05);
    assert.equal(s.foe.hp, Math.floor(max * .3) + Math.round(max * .25)); assert.ok(s.combat.windup < w0);
    t.setState({ foe: { hp: Math.floor(max * .2) } }); const s2 = t.step(.05); assert.equal(s2.foe.hp, Math.floor(max * .2), 'drugi raz nie leczy');
  });
  test('Zegar: po 75 s rycerz traci zdrowie co ćwierć sekundy', () => {
    start({ twist: 'clock' }); t.setState({ elapsed: 76, foe: { x: 1060, state: 'reposition', timer: 0 }, player: { hp: 100 } });
    const s = t.step(1); assert.ok(s.playerHP <= 97 && s.playerHP >= 95, `hp ${s.playerHP}`);
  });
  test('Finta i podwójny cios: pojedynkowicz przerywa zamach, osiłek dokłada drugi cios', () => {
    start({ exhibit: 'robespierre', specials: true, rng: () => .1 }); assert.equal(t.setState({}).special, 'feint');
    t.setState({ foe: { x: 650, state: 'idle', timer: 99 } }); const s = t.step(.05); assert.equal(s.foe.state, 'windup'); assert.equal(s.foe.feint, true);
    const s2 = t.step(s.combat.windup * .6); assert.equal(s2.foe.feint, false); assert.ok(s2.foe.quick, 'po fincie szybki cios');
    start({ exhibit: 'attila', specials: true, rng: () => .1 }); assert.equal(t.setState({}).special, 'double');
    t.setState({ foe: { x: 650, state: 'strike', timer: 0, attackDone: true, heavy: false, quick: 0 }, player: { x: 365 } }); const d = t.step(t.setState({}).combat.strikeDuration + .02);
    assert.equal(d.foe.state, 'recover'); assert.equal(d.foe.followUp, true);
    start({ exhibit: 'attila', specials: false }); assert.equal(t.setState({}).special, null, 'bez specjałów, gdy wyłączone');
  });
})();
