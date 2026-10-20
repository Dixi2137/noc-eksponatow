/* Weapons are data. Five types set the rhythm (blade, heavy, polearm, light, ranged), four eras sort them into crates,
   rarity nudges the damage. Each entry: how the knight strikes, what a parry reflects, what the item is worth. */
(() => {
  'use strict';
  const baseline = Object.freeze({
    kind: 'melee', range: 410, staminaCost: 12, swing: .36, contact: .23, cooldown: .46,
    weakGuardDamage: 9, comboBonus: 3, comboAt: 3, parryDrain: 10,
    parryReflect: Object.freeze({ light: 20, heavy: 25 }), ammo: null, reload: 0
  });
  const types = Object.freeze({
    blade:   { name: 'Ostrza', stats: {} },
    heavy:   { name: 'Broń ciężka', stats: { staminaCost: 16, swing: .46, contact: .3, cooldown: .6, weakGuardDamage: 13, comboBonus: 2, parryReflect: { light: 24, heavy: 30 } } },
    polearm: { name: 'Broń drzewcowa', stats: { range: 470, weakGuardDamage: 8, comboBonus: 2, parryDrain: 6, parryReflect: { light: 18, heavy: 23 } } },
    light:   { name: 'Broń lekka', stats: { staminaCost: 9, swing: .28, contact: .17, cooldown: .34, weakGuardDamage: 7, comboBonus: 5, comboAt: 2, parryReflect: { light: 18, heavy: 22 } } },
    ranged:  { name: 'Broń dystansowa', stats: { kind: 'ranged', range: 900, staminaCost: 6, swing: .42, contact: .2, cooldown: .55, weakGuardDamage: 14, comboBonus: 0, comboAt: 99, parryDrain: 4, parryReflect: { light: 14, heavy: 18 }, ammo: 6, reload: 1.6 } }
  });
  const eras = Object.freeze({ antiquity: 'Starożytność', medieval: 'Średniowiecze', renaissance: 'Nowożytność', modern: 'Wiek XIX i XX' });
  const rarityBonus = { basic: 0, common: 0, rare: 1, epic: 2, legendary: 3 };
  // weapon(id, name, era, type, rarity, icon, flavour, overrides)
  function w(id, name, era, type, rarity, icon, flavour, overrides = {}) {
    return { id, name, era: `${eras[era].toUpperCase()} · ${({ basic: 'KOLEKCJA PODSTAWOWA', common: 'ZWYKŁY EKSPONAT', rare: 'RZADKI EKSPONAT', epic: 'EPICKI EKSPONAT', legendary: 'LEGENDARNY EKSPONAT' })[rarity]}`,
      categoryId: era, type, rarity, icon, flavour, overrides };
  }
  const definitions = [
    // Blades
    w('sword', 'MIECZ RYCERSKI', 'medieval', 'blade', 'basic', 'sword', 'Klasyczne ostrze muzealnego rycerza. Wszystko w nim jest średnie, i o to chodzi.'),
    w('gladius', 'GLADIUS', 'antiquity', 'blade', 'common', 'shortsword', 'Krótki miecz legionisty. Szybszy od rycerskiego, ale sięga bliżej.', { swing: .32, contact: .2, cooldown: .42, range: 380 }),
    w('scimitar', 'SZABLA DAMASCEŃSKA', 'medieval', 'blade', 'common', 'curved', 'Zakrzywiona klinga z damastu. Tnie w serii.', { comboBonus: 4 }),
    w('claymore', 'CLAYMORE', 'medieval', 'blade', 'rare', 'greatsword', 'Dwuręczny miecz Highlandów. Wolniejszy, ale mocniejszy i dłuższy.', { staminaCost: 14, swing: .4, contact: .26, cooldown: .52, range: 440, weakGuardDamage: 11 }),
    w('husaria', 'SZABLA HUSARSKA', 'renaissance', 'blade', 'rare', 'curved', 'Szabla skrzydlatej jazdy. Perfekcyjna parada odbija mocniej niż u miecza.', { parryReflect: { light: 24, heavy: 29 } }),
    w('katana', 'KATANA', 'renaissance', 'blade', 'epic', 'curved', 'Stal składana tysiąc razy. Szybkie cięcia i wysoki bonus serii.', { swing: .3, contact: .19, cooldown: .38, comboBonus: 5, comboAt: 2 }),
    // Heavy
    w('axe', 'TOPÓR BOJOWY', 'medieval', 'heavy', 'common', 'axe', 'Wolny, ale 13 obrażeń w słabą gardę i mocniejsze odbicie parady.'),
    w('warhammer', 'MŁOT BOJOWY', 'medieval', 'heavy', 'rare', 'hammer', 'Młot na zbroje. Ciężkie, rzadkie uderzenia, odbicie parady jak od ściany.', { parryReflect: { light: 28, heavy: 34 }, cooldown: .66 }),
    w('morningstar', 'MORGENSZTERN', 'medieval', 'heavy', 'epic', 'mace', 'Kolczasta kula na łańcuchu. Największe obrażenia w słabą gardę wśród broni wręcz.', { weakGuardDamage: 15, comboBonus: 3 }),
    w('berdysz', 'BERDYSZ', 'renaissance', 'heavy', 'rare', 'poleaxe', 'Topór na długim drzewcu. Zasięg drzewca, siła topora.', { range: 450, weakGuardDamage: 12 }),
    w('labrys', 'LABRYS', 'antiquity', 'heavy', 'common', 'doubleaxe', 'Dwusieczny topór z Krety. Dwa ostrza, dwa razy więcej powodów, żeby się nie zbliżać.', { comboBonus: 3 }),
    // Polearms
    w('spear', 'WŁÓCZNIA HOPLITY', 'antiquity', 'polearm', 'rare', 'spear', 'Trafia przeciwnika, zanim ten wejdzie w zasięg własnego ciosu.'),
    w('trident', 'TRÓJZĄB RETIARIUSA', 'antiquity', 'polearm', 'common', 'trident', 'Trzy groty gladiatora z siecią. Trochę krótszy od włóczni, ale tnie szerzej.', { range: 450, weakGuardDamage: 9 }),
    w('halberd', 'HALABARDA', 'medieval', 'polearm', 'epic', 'halberd', 'Ostrze, hak i grot na jednym drzewcu. Daleko i boleśnie.', { range: 480, weakGuardDamage: 10, comboBonus: 3, parryReflect: { light: 21, heavy: 26 } }),
    w('pike', 'PIKA', 'renaissance', 'polearm', 'common', 'pike', 'Najdłuższa broń w muzeum. Sięga najdalej, zadaje najmniej.', { range: 520, weakGuardDamage: 7 }),
    // Light
    w('rapier', 'RAPIER SZLACHECKI', 'renaissance', 'light', 'epic', 'rapier', 'Bardzo szybkie pchnięcia: 7 obrażeń, +5 już od drugiego trafienia.'),
    w('dagger', 'SZTYLET', 'antiquity', 'light', 'common', 'dagger', 'Krótki i podstępny. Prawie nie kosztuje energii, ale musisz podejść bardzo blisko.', { staminaCost: 7, range: 340, cooldown: .3 }),
    w('bayonet', 'BAGNET', 'modern', 'light', 'rare', 'dagger', 'Bagnet z okopów. Szybki jak sztylet, sięga jak miecz.', { range: 410 }),
    w('stiletto', 'STYLET', 'renaissance', 'light', 'rare', 'dagger', 'Wąskie ostrze między płytami zbroi. Bonus serii od pierwszego powtórzenia.', { comboBonus: 6, comboAt: 2, range: 350 }),
    // Ranged
    w('revolver', 'REWOLWER KUSTOSZA', 'modern', 'ranged', 'legendary', 'revolver', 'Strzał z dystansu w słabą gardę: 17 obrażeń. 6 naboi na walkę, przeładowanie 1,6 s.'),
    w('bow', 'ŁUK REFLEKSYJNY', 'medieval', 'ranged', 'rare', 'bow', 'Łuk ze stepu. Dużo strzał, mniejsze obrażenia, szybkie przeładowanie kołczanu.', { ammo: 10, reload: 1.0, weakGuardDamage: 10, swing: .5, contact: .25 }),
    w('crossbow', 'KUSZA', 'medieval', 'ranged', 'epic', 'crossbow', 'Bełt przebija wszystko. Trzy strzały, długie naciąganie, największe obrażenia na dystans.', { ammo: 3, reload: 2.4, weakGuardDamage: 18 }),
    w('musket', 'MUSZKIET', 'renaissance', 'ranged', 'rare', 'musket', 'Jeden strzał, chmura dymu i długie ładowanie przez lufę.', { ammo: 1, reload: 3.0, weakGuardDamage: 20 }),
    w('shotgun', 'STRZELBA KUSTOSZA', 'modern', 'ranged', 'epic', 'shotgun', 'Dwie lufy. Z bliska bardzo boli, z daleka nie ma sensu.', { ammo: 2, reload: 1.3, weakGuardDamage: 17, range: 520 })
  ];
  const weapons = Object.freeze(definitions.map(d => {
    const type = types[d.type], merged = { ...baseline, ...type.stats, ...d.overrides };
    merged.parryReflect = Object.freeze({ ...baseline.parryReflect, ...(type.stats.parryReflect || {}), ...(d.overrides.parryReflect || {}) });
    merged.weakGuardDamage += rarityBonus[d.rarity] || 0;
    const r = merged.kind === 'ranged' ? `${merged.ammo} ${merged.ammo === 1 ? 'strzał' : merged.ammo < 5 ? 'strzały' : 'strzałów'}, przeładowanie ${merged.reload.toLocaleString('pl-PL')} s. ` : '';
    const summary = `${type.name}. ${merged.weakGuardDamage} obrażeń w słabą gardę${merged.comboBonus ? `, +${merged.comboBonus} od ${merged.comboAt}. ciosu` : ''}. ${r}Zasięg ${merged.range}.`;
    return Object.freeze({ id: d.id, name: d.name, era: d.era, categoryId: d.categoryId, type: d.type, typeName: type.name, rarity: d.rarity, icon: d.icon,
      summary, details: Object.freeze([d.flavour]), stats: Object.freeze(merged) });
  }));
  const byId = new Map(weapons.map(weapon => [weapon.id, weapon]));
  window.MuseumWeapons = Object.freeze({
    baseline, types, eras,
    get(id) { return byId.get(id) || weapons[0]; },
    has(id) { return byId.has(id); },
    all() { return weapons; }
  });
})();
