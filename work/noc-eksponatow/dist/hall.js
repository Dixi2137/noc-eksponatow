/* The player's own museum hall: eight display slots, limited trophies earned by clearing halls, prestige and value. */
(() => {
  'use strict';
  const slots = Object.freeze([
    { id: 'armor-1', kind: 'skin', name: 'POSTUMENT LEWY', hint: 'Zbroja na postumencie przy oknie.' },
    { id: 'armor-2', kind: 'skin', name: 'POSTUMENT PRAWY', hint: 'Zbroja na postumencie przy oknie.' },
    { id: 'weapon-1', kind: 'weapon', name: 'WIESZAK LEWY', hint: 'Broń na ścianie nad konsolą.' },
    { id: 'weapon-2', kind: 'weapon', name: 'WIESZAK PRAWY', hint: 'Broń na ścianie nad konsolą.' },
    { id: 'card-1', kind: 'card', name: 'RAMA LEWA', hint: 'Karta w ramie na ścianie.' },
    { id: 'card-2', kind: 'card', name: 'RAMA PRAWA', hint: 'Karta w ramie na ścianie.' },
    { id: 'trophy-1', kind: 'trophy', name: 'GABLOTA LEWA', hint: 'Trofeum w szklanej gablocie.' },
    { id: 'trophy-2', kind: 'trophy', name: 'GABLOTA PRAWA', hint: 'Trofeum w szklanej gablocie.' }
  ].map(Object.freeze));
  // Trophies are limited: one per cleared hall, never bought, never sold.
  const trophies = Object.freeze([
    { id: 'trophy-raptor', level: 'cretaceous-raptor', name: 'PAZUR VELOCIRAPTORA', era: 'TROFEUM · 75 MLN LAT TEMU', glyph: '⟩', color: '#8fa67a', description: 'Sierpowaty pazur z gabloty, która pękła pierwsza.' },
    { id: 'trophy-rex', level: 'cretaceous-rex', name: 'ZĄB TYRANOZAURA', era: 'TROFEUM · 66 MLN LAT TEMU', glyph: '▲', color: '#d8cfa8', description: 'Dwadzieścia centymetrów szkliwa. Król kredy nie oddał go dobrowolnie.' },
    { id: 'trophy-leonidas', level: 'thermopylae', name: 'PIÓROPUSZ LEONIDASA', era: 'TROFEUM · 480 P.N.E.', glyph: 'Λ', color: '#b3202a', description: 'Czerwony grzebień z korynckiego hełmu. Trzystu go nie oddało, król też nie.' },
    { id: 'trophy-napoleon', level: 'borodino', name: 'DWURÓG CESARZA', era: 'TROFEUM · 1812', glyph: 'N', color: '#1f3a6b', description: 'Kapelusz, który widział Austerlitz. Pod Borodino spadł w śnieg.' },
    { id: 'trophy-hitler', level: 'berlin', name: 'KLUCZ DO BUNKRA', era: 'TROFEUM · 1945', glyph: '⚿', color: '#6b6349', description: 'Ostatni klucz z Kancelarii Rzeszy. Drzwi już nikogo nie chronią.' },
    { id: 'trophy-stalin', level: 'moscow', name: 'FAJKA Z KREMLA', era: 'TROFEUM · 1953', glyph: '★', color: '#b3202a', description: 'Zgaszona na dobre. Ostatnie trofeum nocy.' }
  ].map(trophy => Object.freeze({ ...trophy, kind: 'trophy', rarity: 'legendary', limited: true })));
  const trophyById = new Map(trophies.map(t => [t.id, t]));
  const prestigePoints = Object.freeze({ basic: 1, common: 2, rare: 4, epic: 8, legendary: 16, trophy: 12 });
  const DEFAULT_NAME = 'SALA NOCNEGO STRÓŻA';
  const loot = () => window.MuseumLoot;

  function getTrophy(id) { return trophyById.get(id) || null; }
  function ownedTrophies(profile) { return trophies.filter(t => (profile.cleared || []).includes(t.level)); }
  function hasTrophy(profile, id) { const t = getTrophy(id); return !!t && (profile.cleared || []).includes(t.level); }
  function getItem(id) { return getTrophy(id) || loot().getItem(id); }
  function owns(profile, item) { return item ? item.kind === 'trophy' ? hasTrophy(profile, item.id) : loot().has(profile, item) : false; }
  function candidates(profile, slotId) {
    const slot = slots.find(s => s.id === slotId); if (!slot) return [];
    if (slot.kind === 'trophy') return ownedTrophies(profile);
    return loot().items.filter(item => item.kind === slot.kind && loot().has(profile, item));
  }
  // Resolve the saved slots into items, dropping anything the player no longer owns (sold, for instance).
  function exhibition(profile) {
    const saved = profile.hall?.slots || {};
    return slots.map(slot => { const item = getItem(saved[slot.id]); return { slot, item: item && item.kind === slot.kind && owns(profile, item) ? item : null }; });
  }
  function sanitizeName(value) { const text = String(value ?? '').replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 28); return text || DEFAULT_NAME; }
  function setSlot(profile, slotId, itemId) {
    const slot = slots.find(s => s.id === slotId); if (!slot) return null;
    const next = { ...(profile.hall?.slots || {}) };
    if (itemId == null || itemId === '') delete next[slotId];
    else { const item = getItem(itemId); if (!item || item.kind !== slot.kind || !owns(profile, item)) return null; next[slotId] = item.id; }
    return { ...profile, hall: { name: sanitizeName(profile.hall?.name), slots: next } };
  }
  function rename(profile, name) { return { ...profile, hall: { name: sanitizeName(name), slots: { ...(profile.hall?.slots || {}) } } }; }
  function summary(profile) {
    const shown = exhibition(profile), items = shown.filter(e => e.item).map(e => e.item);
    const value = items.reduce((sum, item) => sum + (item.kind === 'trophy' ? 0 : loot().value(item)), 0);
    const upgrades = items.reduce((sum, item) => sum + (item.kind === 'trophy' ? 0 : loot().upgradeLevel(profile, item.id)), 0);
    const base = items.reduce((sum, item) => sum + (item.kind === 'trophy' ? prestigePoints.trophy : prestigePoints[item.rarity] || 0), 0);
    const full = items.length === slots.length ? 20 : 0;
    return { filled: items.length, total: slots.length, value, prestige: base + upgrades * 2 + full, fullBonus: full, trophies: ownedTrophies(profile).length, trophiesTotal: trophies.length };
  }
  function migrate(source) {
    const src = source && typeof source === 'object' ? source : {};
    const slotsIn = src.slots && typeof src.slots === 'object' ? src.slots : {};
    const out = {};
    for (const slot of slots) if (typeof slotsIn[slot.id] === 'string') out[slot.id] = slotsIn[slot.id];
    return { name: sanitizeName(src.name), slots: out };
  }
  window.MuseumHall = Object.freeze({ slots, trophies, getTrophy, ownedTrophies, hasTrophy, getItem, candidates, exhibition, setSlot, rename, summary, migrate, prestigePoints, DEFAULT_NAME });
})();
