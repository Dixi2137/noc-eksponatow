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
    assert.equal(secret.norm('środa Łódź'), 'SRODALODZ', 'kody bez ogonków i spacji');
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
  // A talker from a pack: swings that miss, lines on a clock that chip the foe, fists instead of whatever is equipped.
  const talker = { id: 'test-talker', weapons: [{ id: 'fists', name: 'PIĘŚCI TESTOWE', categoryId: 'contemporary', type: 'light', rarity: 'mythic', icon: 'fists', flavour: 'x', overrides: { weakGuardDamage: 6, range: 330 }, sprite: 'fists' }],
    skins: [{ id: 'test-talker', name: 'GADUŁA', description: 'x', rarity: 'mythic', shouts: ['raz', 'dwa', 'trzy'] }],
    perks: [{ id: 'test-talker', title: 'GADANIE', summary: 'x', details: ['x'], stats: { attackFailChance: 1, weakGuardDamageMultiplier: .5, unarmed: 1, banterEvery: 4, banterDamage: 1, banterHitChance: 1 } }],
    art: { icons: { fists: ['OAAO', 'OAAO'] }, held: { fists: { hold: ['.'], fwd: ['.'] } }, figures: { 'test-talker': { skin: '#e8cdb8', hair: '#1c1a20', hairUnder: '#b3202a', hairstyle: 'long', coat: '#26232b', trousers: '#201e25', boots: '#111014', build: 'tall', weapon: 'fists', hat: 'none' } } } };
  test('Gaduła z pakietu: pięści zamiast broni, każdy zamach pudłuje, tekst co 4 s rani o 1 HP, rig wysoki i bez stali', () => {
    secret._test.apply(talker);
    const g = window.MuseumGame, t = g._test; g.reset(); let s = g.start({ sound: false, skin: 'test-talker', weapon: 'test-ray', rng: () => .5 });
    assert.equal(s.weapon.id, 'fists', 'walczy pięściami, choć założony jest karabin');
    t.setState({ foe: { x: 650, state: 'recover', timer: 0 }, player: { x: 365, stamina: 100 } }); t.input('attack', true); s = t.step(.05); t.input('attack', false); assert.ok(s.stamina < 100, 'pudło kosztuje wytrzymałość'); t.step(.5); s = g.getState();
    assert.equal(s.foeHP, s.foe.maxHP, 'zamach w powietrze: słaba garda nie oberwała');
    t.setState({ banterClock: 0, foe: { state: 'idle', timer: 0 } }); s = t.step(3); const hp = s.foeHP; s = t.step(1.5); assert.equal(s.foeHP, hp - 1, 'po 4 sekundach farmazon zdejmuje 1 HP');
    s = t.step(4.5); assert.equal(s.foeHP, hp - 2, 'kolejny tekst po następnych 4 sekundach');
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d');
    window.MuseumPixel.drawKnight(c, 32, 60, { pose: 'idle', facing: 1, time: 0, skin: 'test-talker', weapon: 'test-ray' });
    const d = c.getImageData(0, 0, 64, 64).data; let steel = 0, red = 0, top = 64;
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 10) continue; const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]; if (k === 0xc9d6dc) steel++; if (k === 0xb3202a) red++; top = Math.min(top, (i / 4 / 64) | 0); }
    assert.equal(steel, 0, 'bez broni w ręce'); assert.ok(red > 0, 'czerwone włosy pod czarnymi'); assert.ok(top <= 60 - 36, 'wysoka sylwetka: 36 wierszy od ziemi');
  });
  test('Przepalona garda: broń z pierce rani wroga podczas zamachu zamiast być odbita', () => {
    const g = window.MuseumGame, t = g._test; g.reset(); let s = g.start({ sound: false, skin: 'brass', weapon: 'test-ray', rng: () => .99 });
    t.setState({ foe: { x: 650, state: 'windup', timer: 0, heavy: true }, player: { x: 365, stamina: 100 } }); t.input('attack', true); t.step(.05); t.input('attack', false); t.step(.3); s = g.getState();
    assert.ok(s.foe.hp < s.foe.maxHP, 'wiązka przeszła przez gardę'); assert.equal(s.foeState, 'windup', 'zamach trwa dalej');
  });
})();
