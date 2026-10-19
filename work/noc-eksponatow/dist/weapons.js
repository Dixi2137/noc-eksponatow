/* Weapons are data. One entry describes how the knight strikes, what a parry reflects and what the item is worth. */
(() => {
  'use strict';
  const baseline = Object.freeze({
    kind: 'melee',            // melee | ranged
    range: 410,               // max distance between fighters for a hit to connect
    staminaCost: 12,          // stamina spent per swing or shot
    swing: .36,               // seconds the attack animation lasts
    contact: .23,             // remaining swing time at which the blow lands
    cooldown: .46,            // seconds before the next swing
    weakGuardDamage: 9,       // damage against a recovering foe
    comboBonus: 3,            // extra damage from the comboAt-th consecutive hit
    comboAt: 3,
    parryDrain: 10,           // stamina lost when the foe parries this weapon
    parryReflect: Object.freeze({ light: 20, heavy: 25 }), // damage a perfect parry sends back
    ammo: null,               // ranged only: shots per fight before a reload
    reload: 0                 // ranged only: seconds a reload takes (no attacks, guard allowed)
  });
  const definitions = [
    {
      id: 'sword', name: 'MIECZ RYCERSKI', era: 'STAL · KOLEKCJA PODSTAWOWA', rarity: 'basic', icon: 'sword',
      summary: '9 obrażeń w słabą gardę, 12 od trzeciego ciosu w serii.',
      details: ['Klasyczne ostrze muzealnego rycerza. Perfekcyjna parada odbija 20 obrażeń, 25 przy ciężkim ataku.'],
      stats: {}
    },
    {
      id: 'axe', name: 'TOPÓR BOJOWY', era: 'ŻELAZO · ZWYKŁY EKSPONAT', rarity: 'common', icon: 'axe',
      summary: 'Wolny, ale 13 obrażeń w słabą gardę i mocniejsze odbicie parady.',
      details: ['Zamach trwa dłużej i kosztuje 16 energii.', 'Perfekcyjna parada odbija 24 obrażenia, 30 przy ciężkim ataku.'],
      stats: { staminaCost: 16, swing: .46, contact: .3, cooldown: .6, weakGuardDamage: 13, comboBonus: 2, parryReflect: { light: 24, heavy: 30 } }
    },
    {
      id: 'spear', name: 'WŁÓCZNIA HOPLITY', era: 'BRĄZ · RZADKI EKSPONAT', rarity: 'rare', icon: 'spear',
      summary: 'Zasięg 470 zamiast 410. 8 obrażeń, mniejsza strata energii przy parowaniu.',
      details: ['Trafia przeciwnika, zanim ten wejdzie w zasięg własnego ciosu.', 'Sparowana włócznia kosztuje tylko 6 energii.'],
      stats: { range: 470, weakGuardDamage: 8, comboBonus: 2, parryDrain: 6, parryReflect: { light: 18, heavy: 23 } }
    },
    {
      id: 'rapier', name: 'RAPIER SZLACHECKI', era: 'STAL · EPICKI EKSPONAT', rarity: 'epic', icon: 'rapier',
      summary: 'Bardzo szybkie pchnięcia: 7 obrażeń, +5 już od drugiego trafienia.',
      details: ['Zamach 0,28 s i przerwa 0,34 s zamiast 0,36 s i 0,46 s.', 'Kosztuje 9 energii za pchnięcie.'],
      stats: { staminaCost: 9, swing: .28, contact: .17, cooldown: .34, weakGuardDamage: 7, comboBonus: 5, comboAt: 2, parryReflect: { light: 18, heavy: 22 } }
    },
    {
      id: 'revolver', name: 'REWOLWER KUSTOSZA', era: 'PROCH · LEGENDARNY EKSPONAT', rarity: 'legendary', icon: 'revolver', kind: 'ranged',
      summary: 'Strzał z dystansu w słabą gardę: 14 obrażeń. 6 naboi na walkę, przeładowanie 1,6 s.',
      details: ['Działa z całej areny, ale tylko w osłabioną gardę. Zamach i cios przeciwnik odbija, w ruchu robi unik.',
        'Po 6 strzałach rycerz przeładowuje przez 1,6 s: nie strzela, ale może parować.', 'Perfekcyjna parada odbija tylko 14 obrażeń.'],
      stats: { kind: 'ranged', range: 900, staminaCost: 6, swing: .42, contact: .2, cooldown: .55, weakGuardDamage: 14, comboBonus: 0, comboAt: 99,
        parryDrain: 4, parryReflect: { light: 14, heavy: 18 }, ammo: 6, reload: 1.6 }
    }
  ];
  const weapons = Object.freeze(definitions.map(definition => Object.freeze({
    ...definition,
    details: Object.freeze([...(definition.details || [])]),
    stats: Object.freeze({ ...baseline, ...definition.stats,
      parryReflect: Object.freeze({ ...baseline.parryReflect, ...(definition.stats.parryReflect || {}) }) })
  })));
  const byId = new Map(weapons.map(weapon => [weapon.id, weapon]));
  window.MuseumWeapons = Object.freeze({
    baseline,
    get(id) { return byId.get(id) || weapons[0]; },
    has(id) { return byId.has(id); },
    all() { return weapons; }
  });
})();
