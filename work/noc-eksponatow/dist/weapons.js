/* Weapons are data. One entry describes how the knight strikes and what a parry reflects. */
(() => {
  'use strict';
  const baseline = Object.freeze({
    kind: 'melee',            // melee | ranged (ranged arrives with the weapon tab)
    range: 410,               // max distance between fighters for a hit to connect
    staminaCost: 12,          // stamina spent per swing
    swing: .36,               // seconds the attack animation lasts
    contact: .23,             // remaining swing time at which the blow lands
    cooldown: .46,            // seconds before the next swing
    weakGuardDamage: 9,       // damage against a recovering foe
    comboBonus: 3,            // extra damage from the comboAt-th consecutive hit
    comboAt: 3,
    parryDrain: 10,           // stamina lost when the foe parries this weapon
    parryReflect: Object.freeze({ light: 20, heavy: 25 }) // damage a perfect parry sends back
  });
  const definitions = [
    {
      id: 'sword', name: 'MIECZ RYCERSKI', era: 'STAL · KOLEKCJA PODSTAWOWA',
      summary: '9 obrażeń w słabą gardę, 12 od trzeciego ciosu w serii.',
      details: ['Klasyczne ostrze muzealnego rycerza. Perfekcyjna parada odbija 20 obrażeń, 25 przy ciężkim ataku.'],
      stats: {}
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
    all() { return weapons; }
  });
})();
