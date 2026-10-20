/* Hall twists: one named condition per hall that bends the fight (tempo, damage, light, clock, second wind).
   Pure data plus multipliers; game.js applies them when a fight starts and runs the few that need per-frame hooks. */
(() => {
  'use strict';
  const twists = Object.freeze(Object.fromEntries(Object.entries({
    ambush:      { name: 'ZASADZKA',      blurb: 'Przeciwnik czeka tuż za drzwiami i atakuje od pierwszej sekundy.', combat: {}, foeStart: 760, openWithStrike: true },
    frenzy:      { name: 'SZAŁ',          blurb: 'Krótsze zamachy, krótszy odpoczynek. Mniej czasu na parowanie.', combat: { windup: .75, heavyWindup: .75, recovery: .7, heavyRecovery: .7, idleDelay: .6 } },
    iron:        { name: 'ŻELAZNA GARDA', blurb: 'Słaba garda trwa krótko, a blokowanie kosztuje cię więcej sił.', combat: { recovery: .6, heavyRecovery: .6 }, blockCost: 1.5 },
    glass:       { name: 'SZKLANE OSTRZA', blurb: 'Obie strony zadają półtora raza większe obrażenia.', combat: {}, foeDamage: 1.5, playerDamage: 1.5 },
    marathon:    { name: 'MARATON',       blurb: 'Przeciwnik ma więcej zdrowia, za to twoja wytrzymałość wraca szybciej.', combat: {}, foeHP: 1.4, staminaRegen: 1.3 },
    dark:        { name: 'CIEMNA SALA',   blurb: 'Światło zgasło. Znak zamachu pojawia się dopiero w ostatniej chwili.', combat: {}, dark: true },
    clock:       { name: 'ZEGAR',         blurb: 'Masz 75 sekund. Potem każda sekunda kosztuje cię zdrowie.', combat: {}, clock: 75 },
    'second-wind': { name: 'DRUGI ODDECH', blurb: 'Przy jednej trzeciej zdrowia przeciwnik odzyskuje siły i przyspiesza.', combat: {}, secondWind: { at: .35, heal: .25, combat: { windup: .8, heavyWindup: .8, recovery: .85 } } },
    heavyhand:   { name: 'CIĘŻKA RĘKA',   blurb: 'Co drugi atak jest ciężki. Paruj tylko przy błysku.', combat: {}, heavyEvery: 2 }
  }).map(([id, t]) => [id, Object.freeze({ id, ...t })])));
  // The first three halls teach the basics without a twist; afterwards the cycle repeats with a quiet hall every few rooms.
  const cycle = Object.freeze([null, 'ambush', 'frenzy', null, 'glass', 'iron', 'clock', null, 'marathon', 'dark', 'second-wind', null, 'heavyhand']);
  const forIndex = index => index < 3 ? null : cycle[(index - 3) % cycle.length];
  window.MuseumTwists = Object.freeze({ all: () => twists, get: id => (id && twists[id]) || null, forIndex, cycle, count: Object.keys(twists).length });
})();
