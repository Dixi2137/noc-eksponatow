/* Opponents are data. Every exhibit that wakes up at night is one entry: numbers, rhythm and art key. */
(() => {
  'use strict';
  const baseline = Object.freeze({
    hp: 160,
    shadow: 170,              // width of the floor shadow
    art: 'rex',               // key into MuseumArt.fighters
    combat: Object.freeze({
      minGap: 330,            // the fighters never overlap closer than this
      preferredGap: 365,      // distance the foe keeps between attacks
      engageRange: 400,       // closer than this: the foe starts an attack from idle
      range: 395,             // reach of the foe's strike
      strikeReach: 110,       // how far the knight may step from the committed target and still be hit
      approachSpeed: 82, retreatSpeed: 114,
      windup: 1.1, heavyWindup: 1.4,
      strikeDuration: .42, strikeContact: .18,
      recovery: 1.8, heavyRecovery: 2.1,
      heavyEvery: 3,          // every n-th attack is heavy
      idleDelay: .75, retreatTime: .65,
      repositionGap: 385, repositionTime: 1.05
    }),
    damage: Object.freeze({
      light: 16, heavy: 23,                 // late parry
      lightBlocked: 14, heavyBlocked: 19,   // exhausted block
      blockCostLight: 18, blockCostHeavy: 23 // stamina a block or automatic dodge costs
    })
  });
  const definitions = [
    {
      id: 'trex', name: 'TYRANNOSAURUS REX', alias: 'T-Rex',
      tag: 'KREDA PÓŹNA · NR INW. 066', era: '66 milionów lat temu', hall: 'GŁÓWNA GALERIA',
      description: 'Stal kontra 66 milionów lat furii.',
      stats: {}
    }
  ];
  const exhibits = Object.freeze(definitions.map(definition => Object.freeze({
    ...definition,
    stats: Object.freeze({
      ...baseline, ...definition.stats,
      combat: Object.freeze({ ...baseline.combat, ...(definition.stats.combat || {}) }),
      damage: Object.freeze({ ...baseline.damage, ...(definition.stats.damage || {}) })
    })
  })));
  const byId = new Map(exhibits.map(exhibit => [exhibit.id, exhibit]));
  window.MuseumExhibits = Object.freeze({
    baseline,
    get(id) { return byId.get(id) || exhibits[0]; },
    all() { return exhibits; }
  });
})();
