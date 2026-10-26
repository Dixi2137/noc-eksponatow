/* Economy: item catalogue, crates per pool, selling, upgrades, card modifiers, revolver, daily bonus. */
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const loot = window.MuseumLoot, weapons = window.MuseumWeapons, cards = window.MuseumCards, g = window.MuseumGame, t = g._test;
  const fresh = () => loot.migrate(null);
  const rich = (coins = 100000) => ({ ...fresh(), coins });
  const seeded = () => { let k = 0; return () => ((k = (k * 9301 + 49297) % 233280) / 233280); };
  const ownAll = p => ({ ...p, finishes: window.MuseumFinishes.all().map(f => f.id) });   // no mythic finishes left to drop

  test('Świeży profil ma miecz, brak kart, zero ulepszeń i pustą serię logowań', () => {
    const p = fresh();
    assert.deepEqual(p.weapons, ['sword']); assert.equal(p.weapon, 'sword'); assert.deepEqual(p.cards, []); assert.equal(p.card, null);
    assert.deepEqual(p.upgrades, {}); assert.equal(p.login.last, null); assert.equal(p.login.streak, 0);
  });
  test('Migracja starego zapisu zachowuje skiny i monety, nieznane bronie zostawia na później (ukryte pakiety), nieznane karty odrzuca', () => {
    const p = loot.migrate({ coins: 777, owned: ['brass', 'frost'], skin: 'frost', weapons: ['sword', 'axe', 'nie-ma'], weapon: 'nie-ma', cards: ['card-zawisza', 'x'], card: 'card-sword', upgrades: { 'skin:frost': 3, 'weapon:axe': 9, 'card:card-zawisza': 2, 'skin:zzz': 1 }, login: { last: '2026-10-18', streak: 4 } });
    assert.equal(p.coins, 777); assert.ok(p.owned.includes('frost')); assert.equal(p.skin, 'frost');
    assert.deepEqual(p.weapons, ['sword', 'axe', 'nie-ma']); assert.equal(p.weapon, 'nie-ma', 'nieznana założona broń zostaje do czasu rejestracji (weapons.get i tak cofa do miecza)'); assert.equal(weapons.get(p.weapon).id, 'sword');
    assert.deepEqual(p.cards, ['card-zawisza']); assert.equal(p.card, null, 'karta broni nie może być aktywną kartą bohatera');
    assert.deepEqual(p.upgrades, { 'skin:frost': 3, 'weapon:axe': 5, 'skin:zzz': 1 }, 'nieznany skin zachowuje poziom, karta odpada, poziom obcięty do 5'); assert.equal(p.login.streak, 4);
  });
  test('Karty: 33 bohaterów i 20 kart broni, każda z działającym modyfikatorem, karty broni wskazują istniejącą broń', () => {
    const all = cards.all(); assert.equal(cards.heroes().length, 33); assert.equal(cards.weaponCards().length, 20);
    const keys = ['staminaRegenMultiplier', 'maxStamina', 'maxHP', 'defenseCostMultiplier', 'perfectParryWindow', 'weakGuardDamageMultiplier', 'perfectParryHeal', 'incomingDamageMultiplier', 'ammo', 'weaponDamageMultiplier'];
    for (const c of all) { const ks = Object.keys(c.modifiers); assert.ok(ks.length >= 1 && ks.every(k => keys.includes(k)), `${c.id}: ${ks}`); assert.ok(c.initials && c.summary && c.description && c.color, c.id); if (c.type === 'weapon') assert.ok(weapons.has(c.weapon), c.id); }
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    g.reset(); let s = g.start({ sound: false, skin: 'verdigris', weapon: 'ak47', modifiers: cards.get('card-ak47').modifiers }); assert.equal(s.weapon.maxAmmo, weapons.get('ak47').stats.ammo + 5, 'karta AK: +5 naboi');
    g.reset(); s = g.start({ sound: false, skin: 'verdigris', modifiers: cards.get('card-pilsudski').modifiers }); assert.equal(s.player.maxHP, 140, 'Piłsudski: +20 HP');
  });
  test('Migracja nie gubi ulepszeń ani przedmiotów o nieznanych id (ukryte pakiety rejestrują się dopiero po wczytaniu profilu)', () => {
    const p = loot.migrate({ upgrades: { 'weapon:ghost-ray': 3, 'skin:ghost-suit': 2, 'weapon:sword': 1, 'card:card-zawisza': 5, 'weapon:brass': 2 }, weapons: ['ghost-ray', 'nie', 'axe'], owned: ['ghost-suit', 'frost'], finishes: ['ghost-coat'], weapon: 'ghost-ray', skin: 'ghost-suit', savedAt: '2026-10-26T10:00:00.000Z' });
    assert.equal(p.upgrades['weapon:ghost-ray'], 3, 'ulepszenie nieznanej broni zostaje'); assert.equal(p.upgrades['skin:ghost-suit'], 2); assert.equal(p.upgrades['weapon:sword'], 1);
    assert.equal(p.upgrades['card:card-zawisza'], undefined, 'karty nie mają ulepszeń'); assert.equal(p.upgrades['weapon:brass'], undefined, 'znany id złego rodzaju odpada');
    assert.ok(p.weapons.includes('ghost-ray') && p.weapons.includes('nie') && p.weapons.includes('axe'), 'nieznane bronie zostają'); assert.ok(p.owned.includes('ghost-suit') && p.owned.includes('frost'));
    assert.deepEqual(p.finishes, ['ghost-coat']); assert.equal(p.weapon, 'ghost-ray', 'założona nieznana broń zostaje'); assert.equal(p.skin, 'ghost-suit'); assert.equal(p.savedAt, '2026-10-26T10:00:00.000Z');
    const again = loot.migrate(p); assert.equal(again.upgrades['weapon:ghost-ray'], 3, 'druga migracja też nie gubi');
    const big = loot.migrate({ weapons: Array.from({ length: 200 }, (_, i) => 'x' + i) }); assert.ok(big.weapons.length <= 51, 'limit nieznanych id');
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
    let p = ownAll(rich(500000)); const total = weapons.all().length; for (let i = 0; i < total - 1; i++) { const r = loot.reserve(p, seeded(), 'armory'); assert.ok(r, `rezerwacja ${i}`); p = loot.claim(r.profile); }
    assert.equal(p.weapons.length, total); assert.equal(loot.remaining(p, 'armory').length, 0); assert.equal(loot.reserve(p, seeded(), 'armory'), null);
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
  test('Rewolwer: 6 strzałów, potem przeładowanie 1,6 s bez strzelania, z 800 bezczynnego tylko draśnie i odrzuci, pełne obrażenia w słabą gardę', () => {
    g.reset(); let s = g.start({ sound: false, skin: 'verdigris', weapon: 'revolver', rng: () => .9 });
    assert.equal(s.weapon.ammo, 6);
    // A tap, not a hold: holding the trigger would fire again after the cooldown.
    const shoot = (foe, after = .5) => { t.setState({ foe, player: { x: 365, cooldown: 0, stamina: 100 } }); t.input('attack', true); t.step(.05); t.input('attack', false); t.step(after); return g.getState(); };
    // Idle foe is only grazed and shoved back by the bullet (pressure hit), never hit for full damage.
    s = shoot({ x: 365 + 800, state: 'idle', timer: 0, defense: 0 });
    assert.ok(s.foe.hp < 160 && s.foe.hp >= 160 - 7, `draśnięcie: ${s.foe.hp}`); assert.equal(s.foe.defenseKind, 'guard'); assert.equal(s.weapon.ammo, 5); t.setState({ foe: { hp: 160 } });
    // Recovering foe takes 14 from across the arena.
    s = shoot({ x: 365 + 800, state: 'recover', timer: 0, defense: 0 });
    assert.equal(s.foe.hp, 143, 'rewolwer: 14 + 3 za legendę'); assert.equal(s.weapon.ammo, 4);
    for (let i = 0; i < 4; i++) s = shoot({ x: 1000, state: 'idle', timer: 0, defense: 0 }, .6);
    t.setState({ foe: { hp: 143 } });   // the four idle shots only grazed the foe
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
  const ownAll = p => ({ ...p, finishes: window.MuseumFinishes.all().map(f => f.id) });
  test('Skrzynie mieszane losują stroje, bronie i karty; startowa bez epików, legend tylko legendarne', () => {
    const p = ownAll(loot.migrate(null)), random = seeded(), kinds = new Set();
    for (let i = 0; i < 60; i++) kinds.add(loot.draw(p, random, 'night').kind);
    assert.deepEqual([...kinds].sort(), ['card', 'skin', 'weapon']);
    for (let i = 0; i < 40; i++) assert.ok(['common', 'rare'].includes(loot.draw(p, random, 'starter').rarity), 'starter');
    for (let i = 0; i < 20; i++) assert.equal(loot.draw(p, random, 'legends').rarity, 'legendary');
    assert.ok(loot.remaining(p, 'pantheon').every(i => i.kind === 'card' && i.categoryId === 'heroes'));
    assert.ok(loot.remaining(p, 'blueprints').every(i => i.kind === 'card' && i.categoryId === 'arsenal'));
    assert.equal(loot.crates.length, 32); assert.ok(loot.crates.every(c => c.glyph && c.color && c.cost > 0 && c.group));
  });
  test('Lakiernia: ~390 wykończeń w pięciu rzadkościach, dwie skrzynie tylko z wykończeniami, ceny od groszy do tysięcy', () => {
    const F = window.MuseumFinishes, all = F.all(); assert.ok(all.length >= 380 && all.length <= 400, String(all.length));
    const n = r => F.byRarity(r).length; assert.ok(n('common') >= 100 && n('rare') >= 100 && n('epic') >= 70 && n('legendary') >= 40 && n('mythic') >= 20, JSON.stringify({ c: n('common'), r: n('rare'), e: n('epic'), l: n('legendary'), m: n('mythic') }));
    assert.equal(new Set(all.map(x => x.id)).size, all.length, 'unikalne id'); assert.equal(new Set(all.map(x => x.name)).size, all.length, 'unikalne nazwy');
    const cheapest = Math.min(...F.byRarity('common').map(x => x.pricePLN)), dearest = Math.max(...F.byRarity('mythic').map(x => x.pricePLN)); assert.ok(cheapest < 5 && dearest >= 3499, `${cheapest} – ${dearest}`);
    assert.ok(F.byRarity('rare').every(x => x.pricePLN > 9.99) && F.byRarity('epic').every(x => x.pricePLN > 39.99) && F.byRarity('legendary').every(x => x.pricePLN >= 199), 'ceny rosną z rzadkością');
    for (const x of all) { const pal = F.palette(x.id, 1.3); assert.ok(pal && pal.M && pal.W && pal.S, x.id); F.overlay(x.id, 'M', 3, 4, 1.3); F.overlay(x.id, 'W', 0, 0, 0); }
    const p = { ...loot.migrate(null), coins: 50000 }; const pool = loot.remaining(p, 'lacquer'); assert.equal(pool.length, all.length, 'lakiernia ma cały katalog'); assert.ok(pool.every(i => i.kind === 'finish'), 'tylko wykończenia');
    const o = loot.odds(p, 'lacquer'); assert.ok(o.common > 50 && o.mythic < 1 && Math.abs(o.mythic - .5) < .01, JSON.stringify(o));
    const r = loot.reserve(p, () => .1, 'lacquer'); assert.ok(r && r.reward.kind === 'finish' && r.reward.rarity === 'common', 'dół losowania to bieda'); assert.equal(r.cost, 1200);
    const at = loot.remaining(p, 'atelier'); assert.ok(at.length && at.every(i => i.kind === 'finish' && ['epic', 'legendary', 'mythic'].includes(i.rarity)), 'atelier: minimum epickie'); assert.ok(Math.abs(loot.odds(p, 'atelier').mythic - 3) < .01);
    const c = loot.getItem(F.byRarity('common')[0].id); assert.equal(loot.value(c), 240); assert.equal(loot.sellPrice(c), 96); assert.equal(loot.pricePLN(c), Math.round(c.pricePLN * 100));
    assert.ok(loot.remaining(p, 'gallery').every(i => i.kind !== 'finish' || i.rarity === 'mythic'), 'do zwykłych skrzyń wpadają tylko mityczne');
  });
  test('Sejf Kolekcjonera: mityczne wykończenia, nakładanie na dowolną broń, sprzedaż za 6000, nic nie wypada z innych skrzyń', () => {
    const fin = window.MuseumFinishes; assert.equal(fin.handmade.length, 8); assert.ok(fin.byRarity('mythic').every(f => f.pricePLN >= 400 && f.pricePLN <= 5000), 'mityczne: od kilkuset do kilku tysięcy zł'); assert.equal(fin.get('gold-marble').pricePLN, 1499); assert.equal(loot.getItem('gold-marble').pricePLN, 1499); assert.ok(fin.palette('holo', 1).M && fin.palette('gold-marble').M === '#efe9dc');
    const rich = (coins) => ({ ...loot.migrate(null), coins }); let p = rich(50000); const pool = loot.remaining(p, 'collector'); assert.equal(pool.filter(i => i.kind === 'finish').length, window.MuseumFinishes.byRarity('mythic').length); assert.ok(pool.every(i => i.kind !== 'finish' || i.rarity === 'mythic'), 'do sejfu wpadają tylko mityczne wykończenia'); assert.ok(pool.some(i => i.kind === 'skin') && pool.some(i => i.kind === 'weapon') && pool.some(i => i.kind === 'card'), 'sejf miesza mityczne ze zwykłymi');
    assert.ok(Math.abs(loot.odds(p, 'collector').mythic - 3) < .01, 'sejf: 3 % na mityczne');
    for (const id of ['gallery', 'legends', 'armory', 'night']) { const o = loot.odds(p, id).mythic; assert.ok(o > 0 && o < 1.5, `${id}: mityczne ${o}%`); assert.ok(loot.remaining(p, id).some(i => i.kind === 'finish'), id); }
    assert.ok(loot.odds(p, 'gallery').mythic < .4 && loot.odds(p, 'legends').mythic > 1 && loot.odds(p, 'collector').mythic > loot.odds(p, 'legends').mythic, 'tanie ~0,35 %, legendy ~1,2 %, sejf 3 %');
    assert.ok(loot.remaining(ownAll(p), 'gallery').every(i => i.kind !== 'finish'), 'po zebraniu wszystkich nic mitycznego nie zostaje');
    const r = loot.reserve(p, () => .995, 'collector'); assert.ok(r && r.reward.kind === 'finish', 'górne 3 % losowania to wykończenie'); assert.equal(loot.reserve(p, () => .5, 'collector').reward.kind !== 'finish', true, 'środek losowania to zwykły przedmiot'); assert.equal(r.cost, 12000); p = loot.claim(r.profile, { equip: true });
    assert.equal(p.finish, r.reward.id); assert.ok(loot.has(p, r.reward.id)); assert.ok(loot.equipped(p, r.reward.id));
    p = loot.equip(p, r.reward.id); assert.equal(p.finish, null, 'drugie kliknięcie zdejmuje'); assert.equal(loot.value(r.reward), 15000); assert.equal(loot.sellPrice(r.reward), 6000);
    assert.ok(loot.canSell(p, r.reward.id)); const sold = loot.sell(p, r.reward.id); assert.equal(sold.price, 6000); assert.equal(sold.profile.finishes.length, 0);
    const m = loot.migrate({ finishes: ['titanium', 'nie-ma'], finish: 'titanium', weapons: ['sword'] }); assert.deepEqual(m.finishes, ['titanium', 'nie-ma'], 'nieznane wykończenie czeka na rejestrację'); assert.equal(m.finish, 'titanium');
    assert.equal(loot.migrate({ finishes: [], finish: 'titanium' }).finish, null);
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
  test('Ponad 120 broni w 7 typach i 5 epokach, każda z ikoną do narysowania', () => {
    assert.ok(weapons.all().length >= 120, String(weapons.all().length));
    const types = new Set(weapons.all().map(w => w.type)), eras = new Set(weapons.all().map(w => w.categoryId));
    assert.deepEqual([...types].sort(), ['blade', 'bow', 'heavy', 'light', 'pistol', 'polearm', 'rifle']); assert.deepEqual([...eras].sort(), ['antiquity', 'contemporary', 'medieval', 'modern', 'renaissance']);
    for (const type of Object.keys(weapons.types)) assert.ok(weapons.all().filter(w => w.type === type).length >= 10, `co najmniej 10 broni typu ${type}`);
    const c = document.createElement('canvas'); c.width = 360; c.height = 360; const x = c.getContext('2d');
    for (const w of weapons.all()) { x.save(); x.translate(180, 180); art.drawWeaponIcon(x, w); x.restore(); assert.ok(loot.getCategory(w.categoryId), w.id); }
  });
  test('Skrzynie typu i epoki losują tylko pasujące bronie', () => {
    const p = { ...loot.migrate(null), finishes: window.MuseumFinishes.all().map(f => f.id) };
    for (const [crate, check] of [['blades', w => w.type === 'blade'], ['heavy', w => w.type === 'heavy'], ['polearms', w => w.type === 'polearm'], ['light', w => w.type === 'light'], ['bows', w => w.type === 'bow'], ['pistols', w => w.type === 'pistol'], ['rifles', w => w.type === 'rifle'],
      ['era-antiquity', w => w.categoryId === 'antiquity'], ['era-medieval', w => w.categoryId === 'medieval'], ['era-renaissance', w => w.categoryId === 'renaissance'], ['era-modern', w => w.categoryId === 'modern'], ['era-contemporary', w => w.categoryId === 'contemporary']]) {
      const pool = loot.remaining(p, crate); assert.ok(pool.length > 0, crate); assert.ok(pool.every(i => i.kind === 'weapon' && check(i)), crate);
    }
    assert.equal(loot.remaining(p, 'armory').length, weapons.all().length - 1, 'cały arsenał bez miecza podstawowego');
  });
  test('Każda broń dystansowa ma amunicję i przeładowanie, każda wręcz nie', () => {
    for (const w of weapons.all()) {
      if (['bow', 'pistol', 'rifle'].includes(w.type)) { assert.ok(w.stats.ammo > 0 && w.stats.reload > 0, w.id); assert.equal(w.stats.kind, 'ranged'); } else { assert.equal(w.stats.ammo, null, w.id); assert.equal(w.stats.kind, 'melee'); }
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
(() => {
  'use strict';
  const { test, assert } = window.MuseumTests;
  const loot = window.MuseumLoot;
  test('Portfel PLN: wpłaty w groszach, kupno wykończenia z salda, odkup za 75%, nałożonego nie da się sprzedać', () => {
    let p = loot.migrate(null); assert.equal(p.balance, 0);
    p = loot.deposit(p, 21370); assert.equal(p.balance, 21370); assert.equal(loot.deposit(p, 0), null);
    assert.equal(loot.pricePLN('gold-marble'), 149900); assert.equal(loot.sellPricePLN('gold-marble'), 112425);
    assert.equal(loot.canBuyFinish(p, 'gold-marble'), false, 'za mało'); assert.equal(loot.buyFinish(p, 'gold-marble'), null);
    p = loot.deposit(p, 150000); const bought = loot.buyFinish(p, 'gold-marble'); assert.ok(bought); p = bought.profile;
    assert.equal(p.balance, 21370 + 150000 - 149900); assert.deepEqual(p.finishes, ['gold-marble']); assert.equal(loot.canBuyFinish(p, 'gold-marble'), false, 'już masz');
    p = loot.equip(p, 'gold-marble'); assert.equal(loot.sellFinish(p, 'gold-marble'), null, 'nałożone'); p = loot.equip(p, 'gold-marble');
    const sold = loot.sellFinish(p, 'gold-marble'); assert.ok(sold); assert.equal(sold.price, 112425); assert.equal(sold.profile.balance, 21470 + 112425); assert.deepEqual(sold.profile.finishes, []);
    assert.equal(loot.sellFinish(p, 'sword'), null, 'tylko wykończenia'); assert.equal(loot.migrate({ balance: '12.7' }).balance, 12); assert.equal(loot.migrate({ balance: -5 }).balance, 0);
  });
})();
