/* Collectible cards. Hero cards carry one passive bonus; weapon cards boost the matching weapon when it is equipped.
   Bosses of the night patrol (Hitler, Stalin and the rest) are never cards. */
(() => {
  'use strict';
  const heroes = [
    { id: 'card-spartakus', name: 'SPARTAKUS', era: 'TRAK · 71 P.N.E.', rarity: 'common', initials: 'SP', color: '#b5603a',
      summary: '+15% regeneracji energii', description: 'Gladiator, który poprowadził powstanie niewolników przeciw Rzymowi.',
      modifiers: { staminaRegenMultiplier: 1.15 } },
    { id: 'card-pulaski', name: 'KAZIMIERZ PUŁASKI', era: 'KAWALERIA · 1779', rarity: 'common', initials: 'KP', color: '#5b7fa6',
      summary: '+10 maks. energii', description: 'Ojciec amerykańskiej kawalerii, bohater dwóch narodów.',
      modifiers: { maxStamina: 10 } },
    { id: 'card-zawisza', name: 'ZAWISZA CZARNY', era: 'GRUNWALD · 1410', rarity: 'rare', initials: 'ZC', color: '#2f2f3a',
      summary: '+12 maks. HP', description: 'Rycerz, na którym można polegać. Nigdy nie opuścił pola walki.',
      modifiers: { maxHP: 12 } },
    { id: 'card-hannibal', name: 'HANNIBAL BARKAS', era: 'KARTAGINA · 218 P.N.E.', rarity: 'rare', initials: 'HB', color: '#8a6a2f',
      summary: '−15% kosztu obrony', description: 'Przeprowadził słonie przez Alpy i rozbił Rzymian pod Kannami.',
      modifiers: { defenseCostMultiplier: .85 } },
    { id: 'card-kosciuszko', name: 'TADEUSZ KOŚCIUSZKO', era: 'RACŁAWICE · 1794', rarity: 'rare', initials: 'TK', color: '#4a7a4e',
      summary: '+0,05 s okna perfekcyjnej parady', description: 'Inżynier i naczelnik powstania. Kosynierzy zdobyli armaty na jego rozkaz.',
      modifiers: { perfectParryWindow: .05 } },
    { id: 'card-sobieski', name: 'JAN III SOBIESKI', era: 'WIEDEŃ · 1683', rarity: 'epic', initials: 'JS', color: '#a8272c',
      summary: '+15% obrażeń w słabą gardę', description: 'Lew Lechistanu. Husaria pod Wiedniem rozstrzygnęła bitwę w kilka godzin.',
      modifiers: { weakGuardDamageMultiplier: 1.15 } },
    { id: 'card-joanna', name: 'JOANNA D’ARC', era: 'ORLEAN · 1429', rarity: 'epic', initials: 'JA', color: '#c7a24a',
      summary: '+4 HP za perfekcyjną paradę', description: 'Dziewczyna ze sztandarem, która przełamała oblężenie Orleanu.',
      modifiers: { perfectParryHeal: 4 } },
    { id: 'card-chrobry', name: 'BOLESŁAW CHROBRY', era: 'GNIEZNO · 1025', rarity: 'legendary', initials: 'BC', color: '#6b3fa0',
      summary: '−15% otrzymywanych obrażeń', description: 'Pierwszy koronowany król Polski. Nie oddał ani jednej ziemi.',
      modifiers: { incomingDamageMultiplier: .85 } }
  ];
  const weaponCards = [
    { id: 'card-sword', weapon: 'sword', name: 'KARTA: MIECZ RYCERSKI', era: 'KARTA BRONI', rarity: 'common', initials: '⚔', color: '#7f8f96', summary: '+10% obrażeń mieczem', description: 'Założony miecz zadaje o 10% więcej w słabą gardę.' },
    { id: 'card-axe', weapon: 'axe', name: 'KARTA: TOPÓR BOJOWY', era: 'KARTA BRONI', rarity: 'common', initials: '🪓', color: '#8a5a3a', summary: '+10% obrażeń toporem', description: 'Założony topór zadaje o 10% więcej w słabą gardę.' },
    { id: 'card-spear', weapon: 'spear', name: 'KARTA: WŁÓCZNIA', era: 'KARTA BRONI', rarity: 'rare', initials: '↑', color: '#9a7a3a', summary: '+10% obrażeń włócznią', description: 'Założona włócznia zadaje o 10% więcej w słabą gardę.' },
    { id: 'card-rapier', weapon: 'rapier', name: 'KARTA: RAPIER', era: 'KARTA BRONI', rarity: 'epic', initials: '/', color: '#6a6f9a', summary: '+10% obrażeń rapierem', description: 'Założony rapier zadaje o 10% więcej w słabą gardę.' },
    { id: 'card-revolver', weapon: 'revolver', name: 'KARTA: REWOLWER', era: 'KARTA BRONI', rarity: 'legendary', initials: '●', color: '#3a3a3a', summary: '+2 naboje w rewolwerze', description: 'Założony rewolwer ma 8 naboi zamiast 6.' }
  ];
  const cards = Object.freeze([...heroes.map(c => ({ ...c, type: 'hero' })), ...weaponCards.map(c => ({ ...c, type: 'weapon', modifiers: c.weapon === 'revolver' ? { ammo: 2 } : { weaponDamageMultiplier: 1.1 } }))]
    .map(card => Object.freeze({ ...card, modifiers: Object.freeze({ ...card.modifiers }) })));
  const byId = new Map(cards.map(card => [card.id, card]));
  window.MuseumCards = Object.freeze({
    get(id) { return byId.get(id) || null; },
    all() { return cards; },
    heroes() { return cards.filter(card => card.type === 'hero'); },
    weaponCards() { return cards.filter(card => card.type === 'weapon'); }
  });
})();
