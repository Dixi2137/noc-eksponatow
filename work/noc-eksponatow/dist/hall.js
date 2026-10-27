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
    { id: 'trophy-hitler', level: 'berlin', name: 'KLUCZ DO BUNKRA', era: 'TROFEUM · 1945', glyph: '⚿', color: '#6b6349', description: 'Ostatni klucz z Kancelarii Rzeszy. Drzwi już nikogo nie chronią.' },
    { id: 'trophy-stalin', level: 'moscow', name: 'FAJKA Z KREMLA', era: 'TROFEUM · 1953', glyph: '★', color: '#b3202a', description: 'Zgaszona na dobre.' },
    { id: 'trophy-beelzebub', level: 'hell', name: 'CAMARO EXORCIST', era: 'TROFEUM · POZA CZASEM', glyph: '⛟', color: '#3a4536', description: 'Hennessey Exorcist: Camaro z tysiącem koni, stworzone, żeby wypędzać demony. Belzebub nie zdążył zejść z drogi.' },
    { id: 'trophy-xerxes', level: 'plataea', name: 'TIARA KSERKSESA', era: 'TROFEUM · 479 P.N.E.', glyph: '♛', color: '#d4af37', description: 'Złota tiara króla królów. Morze jej nie chciało.' },
    { id: 'trophy-qin', level: 'xianyang', name: 'TERAKOTOWY ŻOŁNIERZ', era: 'TROFEUM · 210 P.N.E.', glyph: '卒', color: '#b08a5a', description: 'Jeden z ośmiu tysięcy. Ten jeden jest twój.' },
    { id: 'trophy-herod', level: 'jerusalem', name: 'PIECZĘĆ HERODA', era: 'TROFEUM · 4 P.N.E.', glyph: '✡', color: '#c9a040', description: 'Pieczęć króla, który nie ufał nikomu.' },
    { id: 'trophy-caligula', level: 'rome-caligula', name: 'PODKOWA INCITATUSA', era: 'TROFEUM · 40', glyph: 'Ω', color: '#c0c0c0', description: 'Podkowa konia-senatora. Jedyny uczciwy senator tamtych czasów.' },
    { id: 'trophy-nero', level: 'rome-nero', name: 'LIRA NERONA', era: 'TROFEUM · 64', glyph: '♪', color: '#d4af37', description: 'Brakuje jednej struny. Spłonęła.' },
    { id: 'trophy-commodus', level: 'colosseum', name: 'HEŁM GLADIATORA', era: 'TROFEUM · 192', glyph: '⚔', color: '#c9a65a', description: 'Hełm cesarza, który wolał arenę od senatu.' },
    { id: 'trophy-attila', level: 'catalaunian', name: 'BICZ ATTYLI', era: 'TROFEUM · 451', glyph: '〰', color: '#8a6a3a', description: 'Bicz Boży. Już nie świszcze.' },
    { id: 'trophy-genghis', level: 'mongolia', name: 'ŁUK CHANA', era: 'TROFEUM · 1211', glyph: '⟩', color: '#c9a040', description: 'Łuk refleksyjny ze stepu. Cięciwa pękła na tobie.' },
    { id: 'trophy-timur', level: 'samarkand', name: 'TURBAN TAMERLANA', era: 'TROFEUM · 1398', glyph: '◉', color: '#f0e8d0', description: 'Biały turban z Samarkandy, bez czaszek w zestawie.' },
    { id: 'trophy-vlad', level: 'wallachia', name: 'PAL DRAKULI', era: 'TROFEUM · 1462', glyph: '†', color: '#8a1a2a', description: 'Pusty. Pierwszy raz od dawna.' },
    { id: 'trophy-torquemada', level: 'seville', name: 'KAPTUR INKWIZYTORA', era: 'TROFEUM · 1483', glyph: '▲', color: '#444444', description: 'Czarny kaptur. Nikt się go już nie spodziewa.' },
    { id: 'trophy-cortes', level: 'tenochtitlan', name: 'MORION CORTÉSA', era: 'TROFEUM · 1521', glyph: '⛑', color: '#9a9aa0', description: 'Stalowy hełm z grzebieniem. Okręty i tak spłonęły.' },
    { id: 'trophy-pizarro', level: 'cajamarca', name: 'ZŁOTO Z CAJAMARKI', era: 'TROFEUM · 1532', glyph: '◆', color: '#d4af37', description: 'Jedna sztabka z pokoju pełnego złota.' },
    { id: 'trophy-ivan', level: 'novgorod', name: 'OKUTA LASKA CARA', era: 'TROFEUM · 1570', glyph: '┃', color: '#8a8a90', description: 'Laska Iwana. Żelazne okucie wciąż ostre.' },
    { id: 'trophy-bathory', level: 'cachtice', name: 'LUSTRO HRABINY', era: 'TROFEUM · 1610', glyph: '◯', color: '#c0c0c0', description: 'Lustro z Czachtic. Nie pokazuje nic ciekawego.' },
    { id: 'trophy-blackbeard', level: 'ocracoke', name: 'KAPELUSZ CZARNOBRODEGO', era: 'TROFEUM · 1718', glyph: '☠', color: '#e8e2d0', description: 'Trójgraniasty, z dziurą po kuli.' },
    { id: 'trophy-robespierre', level: 'paris-1794', name: 'KOKARDA TERRORU', era: 'TROFEUM · 1794', glyph: '◎', color: '#c0392b', description: 'Trójkolorowa kokarda Nieprzekupnego.' },
    { id: 'trophy-napoleon', level: 'borodino', name: 'DWURÓG CESARZA', era: 'TROFEUM · 1812', glyph: 'N', color: '#1f3a6b', description: 'Kapelusz, który widział Austerlitz. Pod Borodino spadł w śnieg.' },
    { id: 'trophy-leopold', level: 'congo', name: 'KORONA LEOPOLDA', era: 'TROFEUM · 1900', glyph: '♔', color: '#d4af37', description: 'Korona króla, który kupił sobie kraj.' },
    { id: 'trophy-rasputin', level: 'petrograd', name: 'KRZYŻ RASPUTINA', era: 'TROFEUM · 1916', glyph: '☦', color: '#8a8a90', description: 'Srebrny krzyż mnicha, którego nie dało się zabić. Do dziś.' },
    { id: 'trophy-capone', level: 'chicago', name: 'FEDORA CAPONE\u2019A', era: 'TROFEUM · 1929', glyph: '◗', color: '#e8e2d0', description: 'Biały kapelusz z Chicago. Bez dziur, co ciekawe.' },
    { id: 'trophy-mussolini', level: 'rome-1940', name: 'FEZ DUCE', era: 'TROFEUM · 1940', glyph: '▬', color: '#222222', description: 'Czarny fez z balkonu Palazzo Venezia.' },
    { id: 'trophy-tojo', level: 'tokyo', name: 'KATANA TŌJŌ', era: 'TROFEUM · 1941', glyph: '刀', color: '#c0c0c0', description: 'Oficerska katana. Rękojeść owinięta jedwabiem.' },
    { id: 'trophy-mao', level: 'beijing', name: 'CZERWONA KSIĄŻECZKA', era: 'TROFEUM · 1966', glyph: '▮', color: '#d33a3a', description: 'Mała czerwona książeczka. Strony puste.' },
    { id: 'trophy-amin', level: 'kampala', name: 'ORDERY AMINA', era: 'TROFEUM · 1976', glyph: '✪', color: '#d4af37', description: 'Garść orderów, które sam sobie nadał.' },
    { id: 'trophy-polpot', level: 'phnom-penh', name: 'CZARNA CHUSTA', era: 'TROFEUM · 1977', glyph: '▪', color: '#333333', description: 'Chusta z Kambodży. Rok zero się skończył.' },
    { id: 'trophy-ceausescu', level: 'bucharest', name: 'MIKROFON Z BALKONU', era: 'TROFEUM · 1989', glyph: '♁', color: '#8a8a90', description: 'Mikrofon z ostatniego przemówienia. Wyłączony.' },
    { id: 'trophy-saddam', level: 'baghdad', name: 'BERET SADDAMA', era: 'TROFEUM · 1991', glyph: '◖', color: '#222222', description: 'Czarny beret z pałacu w Bagdadzie.' },
    { id: 'trophy-escobar', level: 'medellin', name: 'DACHÓWKA Z MEDELLÍN', era: 'TROFEUM · 1993', glyph: '▰', color: '#c9643a', description: 'Dachówka z dachu, na którym wszystko się skończyło.' },
    { id: 'trophy-binladen', level: 'tora-bora', name: 'KAMIEŃ Z JASKINI', era: 'TROFEUM · 2001', glyph: '●', color: '#8a7a5a', description: 'Kamień z Tora Bora. Echo ucichło.' },
    { id: 'trophy-gaddafi', level: 'sirte', name: 'ZŁOTY PISTOLET', era: 'TROFEUM · 2011', glyph: '✦', color: '#d4af37', description: 'Złoty pistolet z Syrty. Ostatnie trofeum nocy. Muzeum ocalone.' },
    { id: 'trophy-nebuchadnezzar', level: 'babylon', name: 'LEW Z BRAMY ISZTAR', era: 'TROFEUM · 587 P.N.E.', glyph: '◈', color: '#1f4f9a', description: 'Glazurowana cegła z lwem. Brama została w Berlinie, lew u ciebie.' },
    { id: 'trophy-sulla', level: 'rome-sulla', name: 'LISTA PROSKRYPCYJNA', era: 'TROFEUM · 82 P.N.E.', glyph: 'X', color: '#c9b37a', description: 'Tablica z Forum. Twoje imię skreślone.' },
    { id: 'trophy-diocletian', level: 'nicomedia', name: 'PURPURA DIOKLECJANA', era: 'TROFEUM · 303', glyph: '♦', color: '#5a1f7a', description: 'Płaszcz cesarza, który sam abdykował. Tym razem nie miał wyboru.' },
    { id: 'trophy-john', level: 'runnymede', name: 'MAGNA CARTA', era: 'TROFEUM · 1215', glyph: '§', color: '#e8dcb8', description: 'Pergamin z pieczęcią. Król podpisał, ty wyegzekwowałeś.' },
    { id: 'trophy-hulagu', level: 'baghdad-1258', name: 'KSIĘGA Z BAGDADU', era: 'TROFEUM · 1258', glyph: '✎', color: '#3a5a8a', description: 'Ocalała z Domu Mądrości. Jeszcze kapie z niej atrament.' },
    { id: 'trophy-henry', level: 'tower-1536', name: 'TOPÓR Z TOWER', era: 'TROFEUM · 1536', glyph: '⚒', color: '#8a8a90', description: 'Topór kata. Tym razem nie poszedł w ruch.' },
    { id: 'trophy-cromwell', level: 'drogheda', name: 'NAPIERŚNIK IRONSIDE', era: 'TROFEUM · 1649', glyph: '⛨', color: '#6a6a72', description: 'Żelazny napierśnik Lorda Protektora. Z wgnieceniem na pamiątkę.' },
    { id: 'trophy-franco', level: 'madrid', name: 'JARZMO I STRZAŁY', era: 'TROFEUM · 1939', glyph: '⚑', color: '#b3202a', description: 'Emblemat Falangi zdjęty z munduru caudillo.' },
    { id: 'trophy-pinochet', level: 'santiago', name: 'CIEMNE OKULARY', era: 'TROFEUM · 1973', glyph: '◖', color: '#1a1a1e', description: 'Okulary generała. Bez nich wyglądał jak zwykły emeryt.' },
    { id: 'trophy-bokassa', level: 'bangui', name: 'ORLI TRON', era: 'TROFEUM · 1977', glyph: '✦', color: '#b3202a', description: 'Złoty orzeł z tronu koronacyjnego. Budżet państwa w jednym meblu.' },
    { id: 'trophy-gilles', level: 'machecoul', name: 'KLUCZ SINOBRODEGO', era: 'TROFEUM · 1440', glyph: '⚿', color: '#8a8a90', description: 'Klucz do komnaty, której nie wolno było otwierać. Plama nie schodzi.' },
    { id: 'trophy-cesare', level: 'rome-borgia', name: 'PIERŚCIEŃ Z TRUCIZNĄ', era: 'TROFEUM · 1503', glyph: '◌', color: '#d4af37', description: 'Pierścień Borgiów ze skrytką. Skrytka pusta, na szczęście.' },
    { id: 'trophy-trujillo', level: 'ciudad-trujillo', name: 'MEDAL DOBROCZYŃCY', era: 'TROFEUM · 1937', glyph: '✵', color: '#1f3a6b', description: 'Order Dobroczyńcy Ojczyzny. Nadany sobie, odebrany przez ciebie.' },
    { id: 'trophy-kimilsung', level: 'pyongyang', name: 'ZNACZEK Z PORTRETEM', era: 'TROFEUM · 1950', glyph: '✪', color: '#b3202a', description: 'Przypinka z wiecznym prezydentem. Noszona obowiązkowo, zdjęta dobrowolnie.' }
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
