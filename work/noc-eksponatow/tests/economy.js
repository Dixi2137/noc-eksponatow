/* Economy: item catalogue, crates per pool, selling, upgrades, card modifiers, revolver, daily bonus. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const loot = window.MuseumLoot, weapons = window.MuseumWeapons, cards = window.MuseumCards, g = window.MuseumGame, t = g._test;
  const fresh = () => loot.migrate(null);
  const rich = (coins = 100000) => ({ ...fresh(), coins });
  const seeded = () => { let k = 0; return () => ((k = (k * 9301 + 49297) % 233280) / 233280); };

  test('Świeży profil ma miecz, brak kart, zero ulepszeń i pustą serię logowań', () => {
    const p = fresh();
    assert.deepEqual(p.weapons, ['sword']); assert.equal(p.weapon, 'sword'); assert.deepEqual(p.cards, []); assert.equal(p.card, null);
    assert.deepEqual(p.upgrades, {}); assert.equal(p.login.last, null); assert.equal(p.login.streak, 0);
  });
  test('Migracja starego zapisu zachowuje skiny i monety, a nieznane bronie i karty odrzuca', () => {
    const p = loot.migrate({ coins: 777, owned: ['brass', 'frost'], skin: 'frost', weapons: ['sword', 'axe', 'nie-ma'], weapon: 'nie-ma', cards: ['card-zawisza', 'x'], card: 'card-sword', upgrades: { 'skin:frost': 3, 'weapon:axe': 9, 'card:card-zawisza': 2, 'skin:zzz': 1 }, login: { last: '2026-10-18', streak: 4 } });
    assert.equal(p.coins, 777); assert.ok(p.owned.includes('frost')); assert.equal(p.skin, 'frost');
    assert.deepEqual(p.weapons, ['sword', 'axe']); assert.equal(p.weapon, 'sword', 'nieznana broń wraca do miecza');
    assert.deepEqual(p.cards, ['card-zawisza']); assert.equal(p.card, null, 'karta broni nie może być aktywną kartą bohatera');
    assert.deepEqual(p.upgrades, { 'skin:frost': 3, 'weapon:axe': 5 }); assert.equal(p.login.streak, 4);
  });
  test('Katalog przedmiotów: każdy skin, broń i karta ma unikalne id, rzadkość i wartość', () => {
    const ids = new Set();
    for (const item of loot.items) { assert.ok(!ids.has(item.id), `duplikat ${item.id}`); ids.add(item.id); assert.ok(loot.rarities[item.rarity], item.id); assert.ok(loot.value(item) >= 0); }
    assert.equal(loot.items.filter(i => i.kind === 'weapon').length, weapons.all().length);
    assert.equal(loot.items.filter(i => i.kind === 'card').length, cards.all().length);
    assert.equal(loot.value('brass'), 0, 'podstawowy strój nic nie jest wart'); assert.equal(loot.value('stachu-jones'), 0, 'prezent nie jest na sprzedaż');
    assert.equal(loot.value('revolver'), 4500); assert.equal(loot.sellPrice('revolver'), 1800);
  });
  test('Skrzynia broni losuje tylko bronie, skrzynia kart tylko karty, galeria tylko stroje', () => {
    const p = fresh(), random = seeded();
    for (let i = 0; i < 20; i++) { assert.equal(loot.draw(p, random, 'armory').kind, 'weapon'); assert.equal(loot.draw(p, random, 'heroes').kind, 'card'); assert.equal(loot.draw(p, random, 'gallery').kind, 'skin'); }
    assert.ok(!loot.remaining(p, 'armory').some(i => i.id === 'sword'), 'miecz podstawowy nie wypada');
  });
  test('Rezerwacja ze skrzyni broni dodaje broń do ekwipunku, a odbiór z założeniem ją zakłada', () => {
    let p = rich(); const r = loot.reserve(p, () => .99, 'armory');
    assert.ok(r && r.reward.kind === 'weapon'); assert.equal(r.profile.coins, p.coins - 1500); assert.ok(r.profile.weapons.includes(r.reward.id)); assert.equal(r.profile.pendingKind, 'weapon');
    p = loot.claim(r.profile, { equip: true }); assert.equal(p.weapon, r.reward.id); assert.equal(p.pendingReward, null);
  });
  test('Karta bohatera aktywuje się przy odbiorze; karta broni nie staje się aktywną kartą', () => {
    let p = rich(); const r = loot.reserve(p, () => .01, 'heroes'); assert.ok(r);
    p = loot.claim(r.profile, { equip: true });
    const card = cards.get(r.reward.id);
    if (card.type === 'hero') assert.equal(p.card, card.id); else assert.equal(p.card, null);
  });
  test('Bez duplikatów: po wyczerpaniu puli broni skrzynia nie da się zarezerwować', () => {
    let p = rich(); for (let i = 0; i < 23; i++) { const r = loot.reserve(p, seeded(), 'armory'); assert.ok(r, `rezerwacja ${i}`); p = loot.claim(r.profile); }
    assert.equal(p.weapons.length, 24); assert.equal(loot.remaining(p, 'armory').length, 0); assert.equal(loot.reserve(p, seeded(), 'armory'), null);
  });
  test('Sprzedaż: nie założonego, nie podstawowego, nie prezentu; płaci 40% i kasuje ulepszenie', () => {
    let p = { ...rich(1000), weapons: ['sword', 'axe'], weapon: 'axe', upgrades: { 'weapon:axe': 2 } };
    assert.equal(loot.canSell(p, 'axe'), false, 'założony topór'); assert.equal(loot.canSell(p, 'sword'), false, 'miecz podstawowy'); assert.equal(loot.canSell(p, 'stachu-jones'), false, 'prezent');
    p = { ...p, weapon: 'sword' }; assert.equal(loot.canSell(p, 'axe'), true);
    const r = loot.sell(p, 'axe'); assert.equal(r.price, 96); assert.equal(r.profile.coins, 1096); assert.deepEqual(r.profile.weapons, ['sword']); assert.equal(r.profile.upgrades['weapon:axe'], undefined);
    assert.equal(loot.sell(r.profile, 'axe'), null, 'drugi raz nie sprzedasz');
  });
  test('Ulepszanie: rosnący koszt, pięć poziomów, odmowa bez żetonów', () => {
    let p = rich(2000); assert.equal(loot.upgradeCost(0), 400); assert.equal(loot.upgradeCost(4), 2800); assert.equal(loot.upgradeCost(5), null);
    let r = loot.upgrade(p, 'sword'); assert.equal(r.level, 1); assert.equal(r.profile.coins, 1600); assert.equal(loot.upgradeEffect('sword', 1), '+8% obrażeń');
    r = loot.upgrade(r.profile, 'brass'); assert.equal(r.level, 1); assert.equal(loot.upgradeEffect('brass', 1), '+6 maks. HP');
    assert.equal(loot.upgrade({ ...p, coins: 100 }, 'sword'), null); assert.equal(loot.upgrade(p, 'card-zawisza'), null, 'kart nie da się ulepszać');
    p = { ...rich(), upgrades: { 'weapon:sword': 5 } }; assert.equal(loot.canUpgrade(p, 'sword'), false, 'maks. poziom');
  });
  test('Modyfikatory łączą kartę bohatera, kartę broni i ulepszenia', () => {
    const p = { ...fresh(), cards: ['card-zawisza', 'card-sword', 'card-sobieski'], card: 'card-sobieski', upgrades: { 'skin:brass': 2, 'weapon:sword': 1 } };
    const m = loot.modifiers(p);
    assert.equal(m.maxHP, 12, 'tylko ulepszenie skina (+6 x2), Zawisza nieaktywny'); assert.close(m.weakGuardDamageMultiplier, 1.15); assert.close(m.weaponDamageMultiplier, 1.1 * 1.08);
    assert.equal(loot.modifiers(fresh()).maxHP, undefined);
  });
  test('Modyfikatory trafiają do walki: HP, obrażenia i naboje', () => {
    g.reset(); let s = g.start({ sound: false, skin: 'verdigris', modifiers: { maxHP: 12, weaponDamageMultiplier: 1.1 } });
    assert.equal(s.player.maxHP, 132);
    t.setState({ foe: { x: 650, state: 'recover', timer: 0 }, player: { x: 365 } }); t.input('attack', true); t.step(.16); t.input('attack', false);
    assert.equal(g.getState().foe.hp, 160 - 10, 'miecz 9 x 1,1 = 10 (w górę)');
    g.reset(); s = g.start({ sound: false, skin: 'verdigris', weapon: 'revolver', modifiers: { ammo: 2 } }); assert.equal(s.weapon.maxAmmo, 8);
  });
  test('Każda broń trafia w słabą gardę swoimi obrażeniami i odbija swoją paradę', () => {
    for (const w of weapons.all()) {
      g.reset(); g.start({ sound: false, skin: 'verdigris', weapon: w.id });
      t.setState({ foe: { x: 365 + 330 + 10, state: 'recover', timer: 0 }, player: { x: 365 } }); t.input('attack', true); t.step(w.stats.swing + .05); t.input('attack', false);
      assert.equal(g.getState().foe.hp, 160 - w.stats.weakGuardDamage, `${w.id}: słaba garda`);
      g.reset(); g.start({ sound: false, skin: 'verdigris', weapon: w.id });
      t.setState({ elapsed: 2, foe: { x: 650, state: 'strike', timer: 0, attackDone: false }, player: { x: 365, stamina: 100 } }); t.input('guard', true); t.step(.25);
      assert.equal(g.getState().foe.hp, 160 - w.stats.parryReflect.light, `${w.id}: odbicie parady`);
    }
  });
  test('Włócznia trafia z 470, miecz z 470 już nie', () => {
    for (const [id, hits] of [['spear', true], ['pike', true], ['sword', false], ['dagger', false]]) {
      g.reset(); g.start({ sound: false, skin: 'verdigris', weapon: id });
      t.setState({ foe: { x: 365 + 460, state: 'recover', timer: 0 }, player: { x: 365 } }); t.input('attack', true); t.step(.4); t.input('attack', false);
      assert.equal(g.getState().foe.hp < 160, hits, id);
    }
  });
  test('Rewolwer: 6 strzałów, potem przeładowanie 1,6 s bez strzelania, trafia z 800 tylko w słabą gardę', () => {
    g.reset(); let s = g.start({ sound: false, skin: 'verdigris', weapon: 'revolver' });
    assert.equal(s.weapon.ammo, 6);
    // A tap, not a hold: holding the trigger would fire again after the cooldown.
    const shoot = (foe, after = .5) => { t.setState({ foe, player: { x: 365, cooldown: 0, stamina: 100 } }); t.input('attack', true); t.step(.05); t.input('attack', false); t.step(after); return g.getState(); };
    // Idle foe dodges the bullet.
    s = shoot({ x: 365 + 800, state: 'idle', timer: 0, defense: 0 });
    assert.equal(s.foe.hp, 160); assert.equal(s.foe.defenseKind, 'dodge'); assert.equal(s.weapon.ammo, 5);
    // Recovering foe takes 14 from across the arena.
    s = shoot({ x: 365 + 800, state: 'recover', timer: 0, defense: 0 });
    assert.equal(s.foe.hp, 143, 'rewolwer: 14 + 3 za legendę'); assert.equal(s.weapon.ammo, 4);
    for (let i = 0; i < 4; i++) s = shoot({ x: 1000, state: 'idle', timer: 0, defense: 0 }, .6);
    assert.equal(s.weapon.ammo, 0); assert.equal(s.weapon.reload, 0, 'przeładowanie nie zaczyna się samo');
    s = shoot({ x: 1000, state: 'recover', timer: -5, defense: 0 }, 0);
    assert.ok(s.weapon.reload > 1.4, 'przeładowanie trwa'); assert.equal(s.foe.hp, 143, 'bez strzału w czasie przeładowania');
    t.input('attack', true); t.step(.3); t.input('attack', false); assert.equal(g.getState().foe.hp, 143, 'strzał w trakcie przeładowania nie pada');
    t.step(1.5); s = g.getState(); assert.equal(s.weapon.reload, 0); assert.equal(s.weapon.ammo, 6, 'bęben pełny');
  });
  test('Bonus dzienny: 50 pierwszego dnia, +25 za każdy kolejny, reset po przerwie, raz dziennie', () => {
    const day = (y, m, d) => new Date(y, m - 1, d, 12);
    let p = fresh(); let r = loot.dailyBonus(p, day(2026, 10, 19)); assert.equal(r.bonus, 80); assert.equal(r.streak, 1); assert.equal(r.profile.coins, 80);
    assert.equal(loot.dailyBonus(r.profile, day(2026, 10, 19)), null, 'drugi raz tego dnia nic');
    r = loot.dailyBonus(r.profile, day(2026, 10, 20)); assert.equal(r.bonus, 120); assert.equal(r.streak, 2);
    r = loot.dailyBonus(r.profile, day(2026, 10, 22)); assert.equal(r.bonus, 80); assert.equal(r.streak, 1); assert.equal(r.reset, true, 'przerwa resetuje serię');
    p = { ...fresh(), login: { last: '2026-10-18', streak: 30 } }; r = loot.dailyBonus(p, day(2026, 10, 19)); assert.equal(r.bonus, 500, 'limit 500');
    assert.equal(loot.dailyBonus({ ...fresh(), login: { last: '2026-12-31', streak: 1 } }, day(2027, 1, 1)).streak, 2, 'przełom roku');
  });
})();
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const loot = window.MuseumLoot, art = window.MuseumArt;
  const seeded = () => { let k = 7; return () => ((k = (k * 9301 + 49297) % 233280) / 233280); };
  test('Skrzynie mieszane losują stroje, bronie i karty; startowa bez epików, legend tylko legendarne', () => {
    const p = loot.migrate(null), random = seeded(), kinds = new Set();
    for (let i = 0; i < 60; i++) kinds.add(loot.draw(p, random, 'night').kind);
    assert.deepEqual([...kinds].sort(), ['card', 'skin', 'weapon']);
    for (let i = 0; i < 40; i++) assert.ok(['common', 'rare'].includes(loot.draw(p, random, 'starter').rarity), 'starter');
    for (let i = 0; i < 20; i++) assert.equal(loot.draw(p, random, 'legends').rarity, 'legendary');
    assert.ok(loot.remaining(p, 'pantheon').every(i => i.kind === 'card' && i.categoryId === 'heroes'));
    assert.ok(loot.remaining(p, 'blueprints').every(i => i.kind === 'card' && i.categoryId === 'arsenal'));
    assert.equal(loot.crates.length, 26); assert.ok(loot.crates.every(c => c.glyph && c.color && c.cost > 0 && c.group));
  });
  test('Każdą skrzynię da się narysować', () => {
    const c = document.createElement('canvas'); c.width = 240; c.height = 200; const x = c.getContext('2d');
    for (const crate of loot.crates) art.drawCrate(x, crate, 240, 200, { time: 1 });
  });
})();

(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const loot = window.MuseumLoot, weapons = window.MuseumWeapons, art = window.MuseumArt, g = window.MuseumGame, t = g._test;
  test('24 bronie w 5 typach i 4 epokach, każda z ikoną do narysowania', () => {
    assert.equal(weapons.all().length, 24);
    const types = new Set(weapons.all().map(w => w.type)), eras = new Set(weapons.all().map(w => w.categoryId));
    assert.deepEqual([...types].sort(), ['blade', 'heavy', 'light', 'polearm', 'ranged']); assert.deepEqual([...eras].sort(), ['antiquity', 'medieval', 'modern', 'renaissance']);
    const c = document.createElement('canvas'); c.width = 360; c.height = 360; const x = c.getContext('2d');
    for (const w of weapons.all()) { x.save(); x.translate(180, 180); art.drawWeaponIcon(x, w); x.restore(); assert.ok(loot.getCategory(w.categoryId), w.id); }
  });
  test('Skrzynie typu i epoki losują tylko pasujące bronie', () => {
    const p = loot.migrate(null);
    for (const [crate, check] of [['blades', w => w.type === 'blade'], ['heavy', w => w.type === 'heavy'], ['polearms', w => w.type === 'polearm'], ['light', w => w.type === 'light'], ['ranged', w => w.type === 'ranged'],
      ['era-antiquity', w => w.categoryId === 'antiquity'], ['era-medieval', w => w.categoryId === 'medieval'], ['era-renaissance', w => w.categoryId === 'renaissance'], ['era-modern', w => w.categoryId === 'modern']]) {
      const pool = loot.remaining(p, crate); assert.ok(pool.length > 0, crate); assert.ok(pool.every(i => i.kind === 'weapon' && check(i)), crate);
    }
    assert.equal(loot.remaining(p, 'armory').length, 23, 'cały arsenał bez miecza podstawowego');
  });
  test('Każda broń dystansowa ma amunicję i przeładowanie, każda wręcz nie', () => {
    for (const w of weapons.all()) {
      if (w.type === 'ranged') { assert.ok(w.stats.ammo > 0 && w.stats.reload > 0, w.id); assert.equal(w.stats.kind, 'ranged'); } else assert.equal(w.stats.ammo, null, w.id);
      g.reset(); const s = g.start({ sound: false, skin: 'verdigris', weapon: w.id }); assert.equal(s.weapon.id, w.id);
      t.setState({ foe: { x: 365 + 330 + 10, state: 'recover', timer: 0 }, player: { x: 365 } }); t.input('attack', true); t.step(.05); t.input('attack', false); t.step(w.stats.swing + .1);
      const hit = g.getState().foe.hp < 160; assert.equal(hit, w.stats.range >= 340, `${w.id}: zasięg ${w.stats.range} vs dystans 340`);
    }
  });
  test('Cennik: skrzynie droższe od wartości przeciętnej nagrody, legendy najdroższe', () => {
    const byId = id => loot.crates.find(c => c.id === id);
    assert.ok(byId('gallery').cost > 600 && byId('legends').cost >= 9000 && byId('relic').cost > byId('treasury').cost);
    assert.ok(loot.crates.every(c => c.pricePLN >= 9.99 && c.pricePLN <= 199.99));
    for (const c of loot.crates) assert.ok(Math.abs(c.cost / c.pricePLN - 40) < 25, `${c.id}: ${Math.round(c.cost / c.pricePLN)} ✦ za 1 zł`);
  });
})();
