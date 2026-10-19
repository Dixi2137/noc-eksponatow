/* Opponents are data. Every exhibit that wakes up at night is one entry: numbers, rhythm and art key. */
(() => {
  'use strict';
  const baseline = Object.freeze({
    hp: 160,
    shadow: 170,              // width of the floor shadow
    art: 'rex',               // key into MuseumArt.fighters
    figure: null,             // costume for the human rig (art: 'figure')
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
  // Humans stand closer than a fossil the size of a bus.
  const human = Object.freeze({ shadow: 96, art: 'figure',
    combat: { minGap: 230, preferredGap: 285, engageRange: 330, range: 300, strikeReach: 95, repositionGap: 300 } });
  const definitions = [
    {
      id: 'raptor', name: 'VELOCIRAPTOR', alias: 'Raptor',
      tag: 'KREDA PÓŹNA · NR INW. 075', era: '75 milionów lat temu', kind: 'dinozaur',
      description: 'Szybki, lekki, nerwowy. Krótkie zamachy, krótki odpoczynek.',
      stats: { hp: 110, shadow: 120, art: 'raptor',
        combat: { minGap: 260, preferredGap: 300, engageRange: 340, range: 310, strikeReach: 100, approachSpeed: 110, retreatSpeed: 140,
          windup: .85, heavyWindup: 1.15, strikeDuration: .36, strikeContact: .15, recovery: 1.3, heavyRecovery: 1.6, heavyEvery: 4, idleDelay: .55, repositionGap: 320, repositionTime: .8 },
        damage: { light: 11, heavy: 17, lightBlocked: 9, heavyBlocked: 14, blockCostLight: 14, blockCostHeavy: 19 } }
    },
    {
      id: 'trex', name: 'TYRANNOSAURUS REX', alias: 'T-Rex',
      tag: 'KREDA PÓŹNA · NR INW. 066', era: '66 milionów lat temu', kind: 'dinozaur',
      description: 'Stal kontra 66 milionów lat furii.',
      stats: {}
    },
    {
      id: 'leonidas', name: 'LEONIDAS I', alias: 'Leonidas',
      tag: 'SPARTA · 480 P.N.E.', era: 'Termopile, 480 p.n.e.', kind: 'postać historyczna',
      description: 'Król Sparty. Włócznia zza tarczy, ciężki cios co drugi raz.',
      stats: { ...human, hp: 180,
        combat: { ...human.combat, range: 330, windup: 1.0, heavyWindup: 1.3, recovery: 1.6, heavyRecovery: 2.0, heavyEvery: 2 },
        damage: { light: 15, heavy: 24, lightBlocked: 12, heavyBlocked: 20, blockCostLight: 18, blockCostHeavy: 26 },
        figure: { skin: '#c9956b', hair: '#2b1d14', cloak: '#8b1a1a', tunic: '#7a1616', armor: '#b08a3e', armorDark: '#6e5321', legs: 'bare',
          boots: '#5a3a22', hat: 'corinthian', hatColor: '#b08a3e', crest: '#b3202a', weapon: 'spear', shield: '#a8792f', shieldGlyph: 'Λ', beard: 'full' } }
    },
    {
      id: 'napoleon', name: 'NAPOLEON BONAPARTE', alias: 'Napoleon',
      tag: 'CESARSTWO · 1812', era: 'Borodino, 1812', kind: 'postać historyczna',
      description: 'Cesarz Francuzów. Szybka szabla, krótkie przerwy między natarciami.',
      stats: { ...human, hp: 170,
        combat: { ...human.combat, approachSpeed: 95, windup: .9, heavyWindup: 1.2, strikeDuration: .38, recovery: 1.4, heavyRecovery: 1.8, heavyEvery: 3, idleDelay: .6 },
        damage: { light: 14, heavy: 21, lightBlocked: 12, heavyBlocked: 17, blockCostLight: 16, blockCostHeavy: 22 },
        figure: { skin: '#e8c3a5', hair: '#3a2a1f', coat: '#1f3a6b', coatDark: '#13254a', lapel: '#e8e4d8', trousers: '#ece7d8', boots: '#1a1a1a',
          hat: 'bicorne', hatColor: '#15191f', cockade: '#c0392b', sash: '#c0392b', weapon: 'sabre', epaulettes: '#d4af37' } }
    },
    {
      id: 'hitler', name: 'ADOLF HITLER', alias: 'Hitler',
      tag: 'BERLIN · 1945', era: 'Bunkier, 1945', kind: 'postać historyczna',
      description: 'Osaczony tyran. Pistolet z bliska, nerwowe, nieregularne natarcia.',
      stats: { ...human, hp: 150,
        combat: { ...human.combat, range: 340, engageRange: 360, windup: .8, heavyWindup: 1.5, strikeDuration: .34, strikeContact: .14, recovery: 1.5, heavyRecovery: 2.3, heavyEvery: 3, idleDelay: .5 },
        damage: { light: 17, heavy: 26, lightBlocked: 13, heavyBlocked: 21, blockCostLight: 20, blockCostHeavy: 27 },
        figure: { skin: '#e6c2a6', hair: '#2a2118', coat: '#6b6349', coatDark: '#4d4634', trousers: '#5a5340', boots: '#1d1a16',
          hat: 'peaked', hatColor: '#5e5740', mustache: 'toothbrush', armband: '#b3202a', weapon: 'pistol' } }
    },
    {
      id: 'stalin', name: 'JÓZEF STALIN', alias: 'Stalin',
      tag: 'MOSKWA · 1953', era: 'Kreml, 1953', kind: 'postać historyczna',
      description: 'Ostatni pojedynek nocy. Najwięcej HP, ciężka szaszka, długie zamachy.',
      stats: { ...human, hp: 220,
        combat: { ...human.combat, approachSpeed: 70, windup: 1.2, heavyWindup: 1.6, strikeDuration: .46, strikeContact: .2, recovery: 1.9, heavyRecovery: 2.4, heavyEvery: 2, idleDelay: .8 },
        damage: { light: 18, heavy: 28, lightBlocked: 15, heavyBlocked: 23, blockCostLight: 21, blockCostHeavy: 30 },
        figure: { skin: '#e3bd9c', hair: '#3b3028', coat: '#6f7a4e', coatDark: '#4e5736', trousers: '#5f6a45', boots: '#1d1a16',
          hat: 'peaked', hatColor: '#6f7a4e', star: '#d33a3a', mustache: 'thick', weapon: 'sabre', epaulettes: '#d4af37' } }
    }
  ];
  const exhibits = Object.freeze(definitions.map(definition => Object.freeze({
    ...definition,
    stats: Object.freeze({
      ...baseline, ...definition.stats,
      combat: Object.freeze({ ...baseline.combat, ...(definition.stats.combat || {}) }),
      damage: Object.freeze({ ...baseline.damage, ...(definition.stats.damage || {}) }),
      figure: definition.stats.figure ? Object.freeze({ ...definition.stats.figure }) : null
    })
  })));
  const byId = new Map(exhibits.map(exhibit => [exhibit.id, exhibit]));
  window.MuseumExhibits = Object.freeze({
    baseline,
    get(id) { return byId.get(id) || byId.get('trex'); },
    all() { return exhibits; }
  });
})();
