/* One museum skin, one combat benefit. Values are locked when a fight begins. */
(() => {
  'use strict';
  const baseline = Object.freeze({
    maxHP: 120, maxStamina: 100, perfectParryWindow: .27,
    incomingDamageMultiplier: 1, staminaRegenMultiplier: 1,
    weakGuardDamageMultiplier: 1, defenseCostMultiplier: 1, perfectParryHeal: 0
  });
  const definitions = [
    {
      id: 'brass', title: 'HARTOWANA STAL', summary: '+20 maks. HP',
      details: ['Zaczynasz każdą walkę ze 140 HP zamiast 120.'],
      stats: { maxHP: 140 }
    },
    {
      id: 'stachu-jones', title: 'UPÓR STACHA', summary: '+30 maks. HP',
      details: ['Stachu zaczyna każdą walkę ze 150 HP zamiast 120. Jego upór daje 30 dodatkowych punktów maksymalnego życia.'],
      stats: { maxHP: 150 }
    },
    {
      id: 'jan-pawel-ii', title: 'NIE LĘKAJCIE SIĘ', summary: '+3 HP za perfekcyjną paradę, +10 maks. HP',
      details: ['Każde perfekcyjne parowanie przywraca 3 HP, do maksymalnego zdrowia. Leczenie nie wskrzesza pokonanej postaci.', 'Zaczynasz każdą walkę ze 130 HP zamiast 120.'],
      stats: { perfectParryHeal: 3, maxHP: 130 }
    },
    {
      id: 'frost', title: 'ZIMNA KREW', summary: '+0,12 s na perfekcyjną paradę',
      details: ['Okno perfekcyjnego parowania trwa 0,39 s zamiast 0,27 s.'],
      stats: { perfectParryWindow: .39 }
    },
    {
      id: 'obsidian', title: 'OBSYDIANOWY PANCERZ', summary: '−20% otrzymywanych obrażeń',
      details: ['Tracisz o 20% mniej HP przy spóźnionej paradzie i osłabionej gardzie.',
        'Obrażenia zaokrąglamy w górę do pełnych punktów HP.'],
      stats: { incomingDamageMultiplier: .8 }
    },
    {
      id: 'verdigris', title: 'DRUGI ODDECH', summary: '+30% regeneracji wytrzymałości',
      details: ['Wytrzymałość odnawia się o 30% szybciej podczas odpoczynku, gardy i ataku.'],
      stats: { staminaRegenMultiplier: 1.3 }
    },
    {
      id: 'ember', title: 'ŻAR KONTRATAKU', summary: '+35% obrażeń w słabą gardę',
      details: ['Twoje ataki po ciosie T-Rexa zadają 13 HP zamiast 9 HP.',
        'Od trzeciego trafienia w serii: 17 HP zamiast 12 HP. Zaokrąglamy w górę.'],
      stats: { weakGuardDamageMultiplier: 1.35 }
    },
    {
      id: 'royal', title: 'KRÓLEWSKA DYSCYPLINA', summary: '−25% kosztu obrony',
      details: ['Garda, perfekcyjna lub spóźniona parada oraz ręczne i automatyczne uniki zużywają o 25% mniej wytrzymałości.',
        'Koszt ataków pozostaje taki sam.'],
      stats: { defenseCostMultiplier: .75 }
    },
    {
      id: 'solar', title: 'SŁONECZNE ODNOWIENIE', summary: '+6 HP za perfekcyjną paradę',
      details: ['Każde perfekcyjne parowanie przywraca 6 HP, do maksymalnego zdrowia.',
        'Leczenie działa wyłącznie podczas walki i nie wskrzesza pokonanej postaci.'],
      stats: { perfectParryHeal: 6 }
    }
  ];
  definitions.push(...window.MuseumKnights.skins.map(skin => ({id:skin.id,...skin.perk})));
  const perks = Object.freeze(definitions.map(definition => Object.freeze({
    ...definition,
    details: Object.freeze([...definition.details]),
    stats: Object.freeze({ ...baseline, ...definition.stats })
  })));
  const byId = new Map(perks.map(perk => [perk.id, perk]));
  window.MuseumPerks = Object.freeze({
    get(id) { return byId.get(id) || perks[0]; },
    all() { return perks; }
  });
})();
