/* Hidden packs: encryption round-trip, unknown code, registration into weapons/loot/perks/pixel, profile secrets. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const secret = window.MuseumSecret, loot = window.MuseumLoot, weapons = window.MuseumWeapons;
  const pack = { id: 'test-pack', weapons: [{ id: 'test-ray', name: 'PROMIEŃ TESTOWY', categoryId: 'contemporary', type: 'rifle', rarity: 'mythic', icon: 'test-ray', flavour: 'Tylko do testów.', overrides: { ammo: 3, reload: 1, weakGuardDamage: 20, pierce: true }, sprite: 'test-ray', palette: { L: '#00ffff' }, glow: true }],
    skins: [{ id: 'test-suit', name: 'STRÓJ TESTOWY', description: 'Neon.', rarity: 'mythic' }],
    perks: [{ id: 'test-suit', title: 'TEST', summary: '+30 HP', details: ['x'], stats: { maxHP: 150 } }],
    art: { icons: { 'test-ray': ['OLLO', 'OLLO'] }, held: { 'test-ray': { hold: ['OL', 'OL'], fwd: ['OLLL'] } }, palettes: { 'test-suit': ['#101010', '#050505', '#303030', '#ffffff', '#00ffff', '#008080'] } } };
  test('Ukryty pakiet: bez kodu nic nie ma, zły kod odrzucony, poprawny kod rejestruje broń, skin, perk i grafikę', async () => {
    assert.ok(secret.count() >= 1, 'w grze jest co najmniej jeden zaszyfrowany pakiet');
    assert.equal(weapons.has('test-ray'), false); assert.equal(loot.getItem('test-suit'), null);
    const blob = await secret._test.encrypt('tajne haslo 123', pack);
    assert.ok(blob.data.length > 100 && !blob.data.includes('PROMIE') && !JSON.stringify(blob).includes('test-ray'), 'blob nie zdradza zawartości');
    const bad = await secret.unlock('inne haslo', [blob]); assert.equal(bad.ok, false); assert.equal(bad.reason, 'unknown');
    const empty = await secret.unlock('   ', [blob]); assert.equal(empty.reason, 'empty');
    const good = await secret.unlock('  Tajne Haslo 123 ', [blob]); assert.ok(good.ok, 'kod normalizowany: spacje i wielkość liter nieistotne'); assert.equal(good.already, false);
    assert.deepEqual(good.items.map(i => i.id), ['test-ray', 'test-suit']);
    assert.ok(weapons.has('test-ray')); const w = weapons.get('test-ray'); assert.equal(w.stats.pierce, true); assert.equal(w.hidden, true); assert.equal(w.sprite, 'test-ray'); assert.ok(w.stats.weakGuardDamage >= 24, 'mityczny bonus +4');
    const item = loot.getItem('test-ray'); assert.equal(item.weight, 0, 'nie wypada ze skrzyń'); assert.equal(loot.value(item), 0, 'nie na sprzedaż');
    assert.ok(loot.skins.some(s => s.id === 'test-suit') && loot.getItem('test-suit').gift, 'skin jako prezent po odblokowaniu');
    assert.equal(window.MuseumPerks.get('test-suit').stats.maxHP, 150);
    const again = await secret.unlock('tajne haslo 123', [blob]); assert.equal(again.already, true, 'drugi raz: już odblokowany');
    for (const id of loot.crates.map(c => c.id)) assert.ok(!loot.remaining(loot.migrate(null), id).some(i => i.id === 'test-ray' || i.id === 'test-suit'), `${id}: ukryte nie w puli`);
    const p = loot.migrate({ secrets: ['TAJNEHASLO123', 'TAJNEHASLO123', 7], weapons: ['test-ray'] });
    assert.deepEqual(p.secrets, ['TAJNEHASLO123'], 'kody w profilu bez duplikatów i śmieci'); assert.ok(p.weapons.includes('test-ray') && p.owned.includes('test-suit'), 'po odblokowaniu broń i skin w profilu');
  });
  test('Przepalona garda: broń z pierce rani wroga podczas zamachu zamiast być odbita', () => {
    const g = window.MuseumGame, t = g._test; g.reset(); let s = g.start({ sound: false, skin: 'brass', weapon: 'test-ray', rng: () => .99 });
    t.setState({ foe: { x: 650, state: 'windup', timer: 0, heavy: true }, player: { x: 365, stamina: 100 } }); t.input('attack', true); t.step(.05); t.input('attack', false); t.step(.3); s = g.getState();
    assert.ok(s.foe.hp < s.foe.maxHP, 'wiązka przeszła przez gardę'); assert.equal(s.foeState, 'windup', 'zamach trwa dalej');
  });
})();
